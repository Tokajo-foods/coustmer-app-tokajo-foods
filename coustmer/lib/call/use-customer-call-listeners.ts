import { useEffect, type MutableRefObject } from 'react';
import { Platform } from 'react-native';

import {
  ensureCallNotificationSetup,
  dismissIncomingCallNotification,
} from '@/lib/call/incoming-call-notify';
import { loadNotifications } from '@/lib/notification/load-notifications';
import {
  listenNativeIncomingCallActions,
  setupNativeIncomingCalls,
} from '@/lib/call/native-incoming-call';
import { disconnectInternetCall } from '@/lib/call/api';
import type {
  CustomerCallPending,
  CustomerCallState,
  CustomerRingMeta,
} from '@/lib/call/customer-call-types';
import { getSocket } from '@/lib/socket/socket';

const TERMINAL = new Set(['ended', 'declined', 'timed_out']);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function fromPushData(raw: unknown): CustomerRingMeta | null {
  const data = asRecord(raw);
  if (String(data.kind ?? '') !== 'internet_call') return null;
  const orderId = String(data.orderId ?? '');
  const callId = String(data.callId ?? '');
  const callerRole = String(data.callerRole ?? 'restaurant');
  if (!orderId || !callId) return null;
  return {
    orderId,
    callId,
    callerRole,
    callerName: typeof data.callerName === 'string' ? data.callerName : null,
    callerLogoUrl: typeof data.callerLogoUrl === 'string' ? data.callerLogoUrl : null,
  };
}

/** Socket + push + CallKeep wiring for customer internet calls. */
export function useCustomerCallListeners(input: {
  token: string | null;
  callRef: MutableRefObject<CustomerCallState | null>;
  pendingByCallId: MutableRefObject<Map<string, CustomerCallPending>>;
  acceptRef: MutableRefObject<(orderId: string, callId: string, callerRole: string) => Promise<void>>;
  declineRef: MutableRefObject<(callId: string) => Promise<void>>;
  ring: (meta: CustomerRingMeta) => Promise<void>;
  clear: (callId?: string) => Promise<void>;
  onTerminalNotice: (message: string) => void;
  onAccepted: (callId: string) => void;
}) {
  const {
    token,
    callRef,
    pendingByCallId,
    acceptRef,
    declineRef,
    ring,
    clear,
    onTerminalNotice,
    onAccepted,
  } = input;

  useEffect(() => {
    if (!token || Platform.OS === 'web') return;
    void ensureCallNotificationSetup();
    void setupNativeIncomingCalls();
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    let alive = true;
    let socket: Awaited<ReturnType<typeof getSocket>> | null = null;
    const onInternet = (payload: unknown) => {
      const row = asRecord(payload);
      const callId = String(row.callId ?? '');
      const orderId = String(row.orderId ?? '');
      const state = String(row.state ?? '');
      const callerRole = String(row.callerRole ?? '');
      const calleeRole = String(row.calleeRole ?? '');
      const callerName = typeof row.callerName === 'string' ? row.callerName : null;
      const callerLogoUrl = typeof row.callerLogoUrl === 'string' ? row.callerLogoUrl : null;
      if (!callId || !orderId) return;
      if (TERMINAL.has(state)) {
        if (callRef.current?.callId === callId) {
          onTerminalNotice(state === 'declined' ? 'Call declined.' : 'Call ended.');
          void clear(callId);
        }
        return;
      }
      if (state === 'ringing' && calleeRole === 'customer') {
        void ring({ orderId, callId, callerRole, callerName, callerLogoUrl });
        return;
      }
      if (state === 'accepted' && callRef.current?.callId === callId) {
        onAccepted(callId);
        void dismissIncomingCallNotification();
      }
    };
    void getSocket().then((next) => {
      if (!alive) return;
      socket = next;
      next.on('call:internet', onInternet as never);
    });
    return () => {
      alive = false;
      socket?.off('call:internet', onInternet as never);
    };
  }, [callRef, clear, onAccepted, onTerminalNotice, ring, token]);

  useEffect(() => {
    if (!token || Platform.OS === 'web') return undefined;
    const cleanups: Array<() => void> = [];
    void (async () => {
      try {
        const Notifications = await loadNotifications();
        if (!Notifications) return;
        await ensureCallNotificationSetup();

        const received = Notifications.addNotificationReceivedListener((notification) => {
          const parsed = fromPushData(notification.request.content.data);
          if (parsed) void ring(parsed);
        });
        cleanups.push(() => received.remove());

        const response = Notifications.addNotificationResponseReceivedListener((res) => {
          const parsed = fromPushData(res.notification.request.content.data);
          if (!parsed) return;
          const action = String(res.actionIdentifier ?? '');
          if (action === 'DECLINE') {
            void declineRef.current(parsed.callId);
            return;
          }
          if (action === 'ACCEPT') {
            void acceptRef.current(parsed.orderId, parsed.callId, parsed.callerRole);
            return;
          }
          void ring(parsed);
        });
        cleanups.push(() => response.remove());

        const last = await Notifications.getLastNotificationResponseAsync();
        const cold = last ? fromPushData(last.notification.request.content.data) : null;
        if (cold) void ring(cold);
      } catch {
        // Expo Go may not support categories / CallKeep.
      }
    })();
    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [acceptRef, declineRef, ring, token]);

  useEffect(() => {
    if (!token || Platform.OS === 'web') return undefined;
    let remove = () => undefined;
    void listenNativeIncomingCallActions({
      onAnswer: (callId) => {
        const current = callRef.current;
        const pending = pendingByCallId.current.get(callId);
        const orderId = current?.callId === callId ? current.orderId : pending?.orderId;
        const callerRole =
          current?.callId === callId ? current.callerRole : pending?.callerRole ?? 'restaurant';
        if (!orderId) return;
        void acceptRef.current(orderId, callId, callerRole);
      },
      onEnd: (callId) => {
        const current = callRef.current;
        const phase = current?.callId === callId ? current.phase : 'ringing';
        if (phase === 'ringing') {
          void declineRef.current(callId);
        } else {
          void (async () => {
            try {
              await disconnectInternetCall(callId);
            } catch {
              // Clear local UI anyway.
            }
            await clear(callId);
          })();
        }
      },
    }).then((cleanup) => {
      remove = cleanup;
    });
    return () => remove();
  }, [acceptRef, callRef, clear, declineRef, pendingByCallId, token]);
}
