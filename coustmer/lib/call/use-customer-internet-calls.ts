import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  acceptInternetCall,
  callErrorMessage,
  declineInternetCall,
  disconnectInternetCall,
  getInternetCall,
} from '@/lib/call/api';
import {
  ensureCallNotificationSetup,
  dismissIncomingCallNotification,
  presentIncomingCallNotification,
} from '@/lib/call/incoming-call-notify';
import {
  connectVoice,
  disconnectVoice,
  ensureMicrophone,
  setVoiceMuted,
  setVoiceSpeaker,
} from '@/lib/call/internet-audio';
import {
  displayNativeIncomingCall,
  endNativeIncomingCall,
  listenNativeIncomingCallActions,
  markNativeCallActive,
  setupNativeIncomingCalls,
} from '@/lib/call/native-incoming-call';
import { getSocket } from '@/lib/socket/socket';
import { useAuthStore } from '@/store/auth-store';

type Phase = 'idle' | 'ringing' | 'active';

export type CustomerCallState = {
  phase: Phase;
  orderId: string;
  callId: string;
  callerRole: string;
  callerName: string;
};

const TERMINAL = new Set(['ended', 'declined', 'timed_out']);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function callerLabel(role: string) {
  if (role === 'restaurant') return 'Restaurant';
  if (role === 'rider') return 'Delivery partner';
  return 'Caller';
}

/**
 * Global customer internet-call host.
 * Prefers native lock-screen UI (CallKeep) + ringtone; falls back to in-app overlay.
 */
export function useCustomerInternetCalls() {
  const token = useAuthStore((s) => s.token);
  const [call, setCall] = useState<CustomerCallState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  /** True when CallKeep is showing the system / lock-screen incoming UI. */
  const [nativeRinging, setNativeRinging] = useState(false);
  const callRef = useRef(call);
  const joined = useRef(false);
  const closed = useRef(new Set<string>());
  const acceptRef = useRef<(orderId: string, callId: string, callerRole: string) => Promise<void>>(
    async () => undefined,
  );
  const declineRef = useRef<(callId: string) => Promise<void>>(async () => undefined);
  callRef.current = call;

  const clear = useCallback(async (callId?: string) => {
    if (callId) {
      closed.current.add(callId);
      await endNativeIncomingCall(callId);
    }
    joined.current = false;
    setMuted(false);
    setSpeaker(true);
    setNativeRinging(false);
    setCall(null);
    setBusy(null);
    await dismissIncomingCallNotification();
    await disconnectVoice();
  }, []);

  const ring = useCallback(async (orderId: string, callId: string, callerRole: string) => {
    if (!callId || closed.current.has(callId)) return;
    const current = callRef.current;
    if (current && current.callId !== callId) return;
    const next: CustomerCallState = {
      phase: 'ringing',
      orderId,
      callId,
      callerRole,
      callerName: callerLabel(callerRole),
    };
    setCall(next);
    setNotice(null);

    const shownNative = await displayNativeIncomingCall({
      callId,
      callerName: next.callerName,
    });
    setNativeRinging(shownNative);

    // Always fire a high-priority notification with ringtone as backup
    // (cold start / Expo Go / when CallKeep is unavailable).
    await presentIncomingCallNotification({
      orderId,
      callId,
      callerRole,
      callerName: next.callerName,
    });
  }, []);

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
      if (!callId || !orderId) return;
      if (TERMINAL.has(state)) {
        if (callRef.current?.callId === callId) {
          setNotice(state === 'declined' ? 'Call declined.' : 'Call ended.');
          void clear(callId);
        }
        return;
      }
      if (state === 'ringing' && calleeRole === 'customer') {
        void ring(orderId, callId, callerRole);
        return;
      }
      if (state === 'accepted' && callRef.current?.callId === callId) {
        setCall((prev) => (prev ? { ...prev, phase: 'active' } : prev));
        setNativeRinging(false);
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
  }, [clear, ring, token]);

  useEffect(() => {
    if (!token || Platform.OS === 'web') return undefined;
    const cleanups: Array<() => void> = [];
    void (async () => {
      try {
        const Notifications = await import('expo-notifications');
        await ensureCallNotificationSetup();

        const fromData = (raw: unknown) => {
          const data = asRecord(raw);
          if (String(data.kind ?? '') !== 'internet_call') return null;
          const orderId = String(data.orderId ?? '');
          const callId = String(data.callId ?? '');
          const callerRole = String(data.callerRole ?? 'restaurant');
          if (!orderId || !callId) return null;
          return { orderId, callId, callerRole };
        };

        // Push delivered while JS is alive → show lock-screen CallKeep + ringtone.
        const received = Notifications.addNotificationReceivedListener((notification) => {
          const parsed = fromData(notification.request.content.data);
          if (parsed) void ring(parsed.orderId, parsed.callId, parsed.callerRole);
        });
        cleanups.push(() => received.remove());

        const response = Notifications.addNotificationResponseReceivedListener((res) => {
          const parsed = fromData(res.notification.request.content.data);
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
          void ring(parsed.orderId, parsed.callId, parsed.callerRole);
        });
        cleanups.push(() => response.remove());

        // Cold start after tapping a missed-call notification.
        const last = await Notifications.getLastNotificationResponseAsync();
        const cold = last ? fromData(last.notification.request.content.data) : null;
        if (cold) void ring(cold.orderId, cold.callId, cold.callerRole);
      } catch {
        // Expo Go may not support categories / CallKeep.
      }
    })();
    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [ring, token]);

  // Lock-screen Answer / Decline from CallKeep / ConnectionService.
  useEffect(() => {
    if (!token || Platform.OS === 'web') return undefined;
    let remove = () => undefined;
    void listenNativeIncomingCallActions({
      onAnswer: (callId) => {
        const current = callRef.current;
        if (!current || current.callId !== callId) return;
        void acceptRef.current(current.orderId, callId, current.callerRole);
      },
      onEnd: (callId) => {
        const current = callRef.current;
        if (!current || current.callId !== callId) return;
        if (current.phase === 'ringing') {
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
  }, [clear, token]);

  async function acceptFromIds(orderId: string, callId: string, callerRole: string) {
    if (closed.current.has(callId)) return;
    setBusy('accept');
    setNotice(null);
    try {
      await ensureMicrophone();
      const session = await acceptInternetCall(callId);
      if (!session.token || !session.livekitUrl) throw new Error('Call audio is not ready.');
      await connectVoice(session.livekitUrl, session.token);
      joined.current = true;
      await setVoiceSpeaker(true);
      setSpeaker(true);
      setNativeRinging(false);
      setCall({
        phase: 'active',
        orderId,
        callId,
        callerRole,
        callerName: callerLabel(callerRole),
      });
      await markNativeCallActive(callId);
      await dismissIncomingCallNotification();
    } catch (err) {
      setNotice(callErrorMessage(err));
      await clear(callId);
    } finally {
      setBusy(null);
    }
  }
  acceptRef.current = acceptFromIds;

  async function declineFromId(callId: string) {
    setBusy('decline');
    try {
      await declineInternetCall(callId);
    } catch (err) {
      setNotice(callErrorMessage(err));
    }
    await clear(callId);
  }
  declineRef.current = declineFromId;

  async function accept() {
    if (!call || call.phase !== 'ringing') return;
    await acceptFromIds(call.orderId, call.callId, call.callerRole);
  }

  async function decline() {
    if (!call) return;
    await declineFromId(call.callId);
  }

  async function hangup() {
    if (!call) return;
    setBusy('end');
    const callId = call.callId;
    try {
      await disconnectInternetCall(callId);
    } catch (err) {
      setNotice(callErrorMessage(err));
    }
    await clear(callId);
  }

  async function toggleMute() {
    const next = !muted;
    try {
      await setVoiceMuted(next);
      setMuted(next);
    } catch (err) {
      setNotice(callErrorMessage(err));
    }
  }

  async function toggleSpeaker() {
    const next = !speaker;
    try {
      await setVoiceSpeaker(next);
      setSpeaker(next);
    } catch (err) {
      setNotice(callErrorMessage(err));
    }
  }

  // Poll while ringing / active so timeout still ends the UI when sockets miss.
  useEffect(() => {
    if (!call) return undefined;
    let stop = false;
    const tick = async () => {
      try {
        const session = await getInternetCall(call.callId);
        if (stop || closed.current.has(call.callId)) return;
        if (TERMINAL.has(session.state)) {
          setNotice(session.state === 'timed_out' ? 'Missed call.' : 'Call ended.');
          await clear(call.callId);
        }
      } catch {
        // Ignore transient poll errors.
      }
    };
    const timer = setInterval(() => void tick(), 4_000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [call?.callId, clear]);

  return {
    call,
    busy,
    muted,
    speaker,
    notice,
    /** When true, skip in-app IncomingCallOverlay — system lock-screen UI is ringing. */
    nativeRinging,
    accept,
    decline,
    hangup,
    toggleMute,
    toggleSpeaker,
    dismissNotice: () => setNotice(null),
  };
}
