/**
 * Socket.IO singleton — customer app.
 *
 * Auth flow (§1 Gateway):
 *   1. POST /api/v1/socket-token  → { token }
 *   2. Connect io(GATEWAY, { auth: { socketToken: token } })
 *
 * A fresh token is minted on every (re)connect attempt, so a 10-minute token never strands the socket.
 */

import { AppState, type AppStateStatus } from 'react-native';
import { io, Socket } from 'socket.io-client';

import { api, API_BASE_URL } from '@/lib/api';
import type { ClientToServerEvents, ServerToClientEvents, TrackOrderAck } from '@/lib/socket/types';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export type SocketConnection = 'idle' | 'connecting' | 'connected' | 'disconnected';

type AnyHandler = (...args: unknown[]) => void;

const JOIN_RETRY_MS = 5_000;
const AUTH_RETRY_MS = 4_000;
const AUTH_RETRY_MAX_MS = 60_000;

let _socket: AppSocket | null = null;
let _tokenPromise: Promise<string | null> | null = null;
let _connection: SocketConnection = 'idle';
let _appStateSub: { remove: () => void } | null = null;
const trackedOrders = new Map<string, number>();
const joinRetries = new Map<string, ReturnType<typeof setTimeout>>();
const listeners = new Map<string, Set<AnyHandler>>();
const connectionWatchers = new Set<() => void>();

function setConnection(next: SocketConnection) {
  if (_connection === next) return;
  _connection = next;
  for (const watcher of connectionWatchers) watcher();
}

export function getSocketConnection(): SocketConnection {
  return _connection;
}

export function watchSocketConnection(onChange: () => void): () => void {
  connectionWatchers.add(onChange);
  return () => connectionWatchers.delete(onChange);
}

/** Handlers live here, not on a socket instance, so they survive reconnectSocket() after login. */
export function subscribeSocketEvent(event: string, handler: AnyHandler): () => void {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  set.add(handler);
  return () => {
    set?.delete(handler);
  };
}

function dispatch(event: string, args: unknown[]) {
  const set = listeners.get(event);
  if (!set) return;
  for (const handler of [...set]) {
    try {
      handler(...args);
    } catch {
      // one bad screen handler must not break the others
    }
  }
}

function clearJoinRetry(orderId: string) {
  const timer = joinRetries.get(orderId);
  if (timer) clearTimeout(timer);
  joinRetries.delete(orderId);
}

function joinOrderRoom(socket: AppSocket, orderId: string) {
  clearJoinRetry(orderId);
  socket.emit('track:order', { orderId }, (ack?: TrackOrderAck) => {
    if (!ack || ack.ok || !trackedOrders.has(orderId)) return;
    if (ack.code === 'FORBIDDEN' || ack.code === 'ORDER_NOT_FOUND' || ack.code === 'VALIDATION_ERROR') return;
    joinRetries.set(orderId, setTimeout(() => {
      joinRetries.delete(orderId);
      if (_socket?.connected && trackedOrders.has(orderId)) joinOrderRoom(_socket, orderId);
    }, JOIN_RETRY_MS));
  });
}

function rejoinTrackedOrders(socket: AppSocket) {
  for (const orderId of trackedOrders.keys()) joinOrderRoom(socket, orderId);
}

async function fetchSocketToken(): Promise<string | null> {
  try {
    const res = await api.post<{ token?: string; socketToken?: string; data?: { token?: string; socketToken?: string } }>(
      '/api/v1/socket-token',
      {},
      { withCredentials: true }
    );
    const d = res.data;
    return d?.token ?? d?.socketToken ?? d?.data?.socketToken ?? d?.data?.token ?? null;
  } catch {
    return null;
  }
}

async function getSocketToken(): Promise<string | null> {
  if (_tokenPromise) return _tokenPromise;
  _tokenPromise = fetchSocketToken().finally(() => { _tokenPromise = null; });
  return _tokenPromise;
}

function onAppStateChange(state: AppStateStatus) {
  if (state !== 'active' || !_socket) return;
  if (!_socket.connected && !_socket.active) {
    setConnection('connecting');
    _socket.connect();
  }
}

function createSocket(): AppSocket {
  const gatewayUrl = API_BASE_URL || 'http://localhost:4000';
  const socket = io(gatewayUrl, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: (cb) => {
      void getSocketToken().then((token) => cb(token ? { socketToken: token } : {}));
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 12000,
    timeout: 20000,
  }) as AppSocket;

  socket.onAny((event: string, ...args: unknown[]) => dispatch(event, args));
  let authRetryMs = AUTH_RETRY_MS;
  socket.on('connect', () => {
    authRetryMs = AUTH_RETRY_MS;
    setConnection('connected');
    rejoinTrackedOrders(socket);
  });
  socket.on('disconnect', () => setConnection('disconnected'));
  socket.on('connect_error', () => {
    setConnection('disconnected');
    // Middleware rejections (expired token / session) stop the built-in reconnection loop.
    if (socket.active) return;
    const wait = authRetryMs;
    authRetryMs = Math.min(authRetryMs * 2, AUTH_RETRY_MAX_MS);
    setTimeout(() => {
      if (_socket === socket && !socket.connected && !socket.active) socket.connect();
    }, wait);
  });

  if (!_appStateSub) _appStateSub = AppState.addEventListener('change', onAppStateChange);
  setConnection('connecting');
  return socket;
}

/**
 * Returns (and lazily creates) the singleton socket. An instance that is mid-reconnect is
 * returned as-is; tearing it down would orphan every listener and room join.
 */
export async function getSocket(): Promise<AppSocket> {
  if (!_socket) _socket = createSocket();
  return _socket;
}

/** Call after successful login to force a fresh authenticated connection. */
export async function reconnectSocket(): Promise<void> {
  if (_socket) {
    _socket.removeAllListeners();
    _socket.disconnect();
    _socket = null;
  }
  await getSocket();
}

/** Call on logout to cleanly tear down. */
export function disconnectSocket(): void {
  if (_socket) {
    _socket.removeAllListeners();
    _socket.disconnect();
    _socket = null;
  }
  for (const orderId of [...joinRetries.keys()]) clearJoinRetry(orderId);
  _appStateSub?.remove();
  _appStateSub = null;
  setConnection('idle');
}

/** Join `order:{orderId}` so the server pushes status, rider GPS, and ETA. Ref-counted per screen. */
export async function trackOrder(orderId: string): Promise<void> {
  if (!orderId) return;
  const count = (trackedOrders.get(orderId) ?? 0) + 1;
  trackedOrders.set(orderId, count);
  const socket = await getSocket();
  if (count === 1 && socket.connected) joinOrderRoom(socket, orderId);
}

export function untrackOrder(orderId: string): void {
  const next = (trackedOrders.get(orderId) ?? 1) - 1;
  if (next > 0) {
    trackedOrders.set(orderId, next);
    return;
  }
  trackedOrders.delete(orderId);
  clearJoinRetry(orderId);
  if (_socket?.connected) _socket.emit('untrack:order', { orderId });
}

/** Send an in-trip chat message to the rider. */
export async function sendChatMessage(orderId: string, text: string): Promise<void> {
  const socket = await getSocket();
  socket.emit('chat:new-message', { orderId, text, to: 'partner' });
}

/** Emit typing indicator. */
export async function emitTyping(orderId: string, isTyping: boolean): Promise<void> {
  const socket = await getSocket();
  socket.emit('typing', { orderId, isTyping });
}
