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
 * Global customer internet-call host: notification Accept/Decline + in-call mute/speaker.
 * Incoming UI does not live on the order tracking screen.
 */
export function useCustomerInternetCalls() {
  const token = useAuthStore((s) => s.token);
  const [call, setCall] = useState<CustomerCallState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const callRef = useRef(call);
  const joined = useRef(false);
  const closed = useRef(new Set<string>());
  const acceptRef = useRef<(orderId: string, callId: string, callerRole: string) => Promise<void>>(
    async () => undefined,
  );
  callRef.current = call;

  const clear = useCallback(async (callId?: string) => {
    if (callId) closed.current.add(callId);
    joined.current = false;
    setMuted(false);
    setSpeaker(true);
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
    let remove = () => undefined;
    void (async () => {
      try {
        const Notifications = await import('expo-notifications');
        await ensureCallNotificationSetup();
        const sub = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = asRecord(response.notification.request.content.data);
          if (String(data.kind ?? '') !== 'internet_call') return;
          const orderId = String(data.orderId ?? '');
          const callId = String(data.callId ?? '');
          const callerRole = String(data.callerRole ?? 'restaurant');
          if (!orderId || !callId) return;
          const action = String(response.actionIdentifier ?? '');
          if (action === 'DECLINE') {
            void (async () => {
              try {
                await declineInternetCall(callId);
              } catch {
                // Still clear local UI.
              }
              await clear(callId);
            })();
            return;
          }
          if (action === 'ACCEPT') {
            void acceptRef.current(orderId, callId, callerRole);
            return;
          }
          // Notification body tap: show the full-screen incoming UI.
          void ring(orderId, callId, callerRole);
        });
        remove = () => sub.remove();
      } catch {
        // Expo Go may not support categories.
      }
    })();
    return () => remove();
  }, [clear, ring, token]);

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
      setCall({
        phase: 'active',
        orderId,
        callId,
        callerRole,
        callerName: callerLabel(callerRole),
      });
      await dismissIncomingCallNotification();
    } catch (err) {
      setNotice(callErrorMessage(err));
      await clear(callId);
    } finally {
      setBusy(null);
    }
  }
  acceptRef.current = acceptFromIds;

  async function accept() {
    if (!call || call.phase !== 'ringing') return;
    await acceptFromIds(call.orderId, call.callId, call.callerRole);
  }

  async function decline() {
    if (!call) return;
    setBusy('decline');
    const callId = call.callId;
    try {
      await declineInternetCall(callId);
    } catch (err) {
      setNotice(callErrorMessage(err));
    }
    await clear(callId);
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
    accept,
    decline,
    hangup,
    toggleMute,
    toggleSpeaker,
    dismissNotice: () => setNotice(null),
  };
}
