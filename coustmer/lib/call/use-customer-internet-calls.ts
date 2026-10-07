import { useCallback, useEffect, useRef, useState } from 'react';

import {
  acceptInternetCall,
  callErrorMessage,
  declineInternetCall,
  disconnectInternetCall,
  getInternetCall,
} from '@/lib/call/api';
import {
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
  bringAppToForeground,
  displayNativeIncomingCall,
  endNativeIncomingCall,
  markNativeCallActive,
} from '@/lib/call/native-incoming-call';
import type { CustomerCallState, CustomerRingMeta } from '@/lib/call/customer-call-types';
import { useCustomerCallListeners } from '@/lib/call/use-customer-call-listeners';
import { useAuthStore } from '@/store/auth-store';

export type { CustomerCallState } from '@/lib/call/customer-call-types';

const TERMINAL = new Set(['ended', 'declined', 'timed_out']);

function callerLabel(role: string) {
  if (role === 'restaurant') return 'Restaurant';
  if (role === 'rider') return 'Delivery partner';
  return 'Caller';
}

function resolveCallerName(role: string, name?: string | null) {
  return name?.trim() || callerLabel(role);
}

/**
 * Global customer internet-call host.
 * Lock-screen CallKeep when possible; push when app is closed; restaurant name + logo.
 */
export function useCustomerInternetCalls() {
  const token = useAuthStore((s) => s.token);
  const [call, setCall] = useState<CustomerCallState | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [nativeRinging, setNativeRinging] = useState(false);
  const callRef = useRef(call);
  const joined = useRef(false);
  const closed = useRef(new Set<string>());
  const pendingByCallId = useRef(
    new Map<string, { orderId: string; callerRole: string; callerName: string; callerLogoUrl: string | null }>(),
  );
  const acceptRef = useRef<(orderId: string, callId: string, callerRole: string) => Promise<void>>(
    async () => undefined,
  );
  const declineRef = useRef<(callId: string) => Promise<void>>(async () => undefined);
  callRef.current = call;

  const clear = useCallback(async (callId?: string) => {
    if (callId) {
      closed.current.add(callId);
      pendingByCallId.current.delete(callId);
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

  const ring = useCallback(async (meta: CustomerRingMeta) => {
    const { orderId, callId, callerRole } = meta;
    if (!callId || closed.current.has(callId)) return;
    const current = callRef.current;
    if (current && current.callId !== callId) return;
    const callerName = resolveCallerName(callerRole, meta.callerName);
    const callerLogoUrl = meta.callerLogoUrl?.trim() || current?.callerLogoUrl || null;
    const next: CustomerCallState = {
      phase: 'ringing',
      orderId,
      callId,
      callerRole,
      callerName,
      callerLogoUrl,
    };
    pendingByCallId.current.set(callId, { orderId, callerRole, callerName, callerLogoUrl });
    setCall(next);
    setNotice(null);

    const shownNative = await displayNativeIncomingCall({ callId, callerName });
    setNativeRinging(shownNative);

    await presentIncomingCallNotification({
      orderId,
      callId,
      callerRole,
      callerName,
      callerLogoUrl,
    });
  }, []);

  const onTerminalNotice = useCallback((message: string) => setNotice(message), []);
  const onAccepted = useCallback((callId: string) => {
    setCall((prev) => (prev?.callId === callId ? { ...prev, phase: 'active' } : prev));
    setNativeRinging(false);
  }, []);

  useCustomerCallListeners({
    token,
    callRef,
    pendingByCallId,
    acceptRef,
    declineRef,
    ring,
    clear,
    onTerminalNotice,
    onAccepted,
  });

  async function acceptFromIds(orderId: string, callId: string, callerRole: string) {
    if (closed.current.has(callId)) return;
    const pending = pendingByCallId.current.get(callId);
    const name = pending?.callerName ?? callRef.current?.callerName ?? callerLabel(callerRole);
    const logo = pending?.callerLogoUrl ?? callRef.current?.callerLogoUrl ?? null;
    setNativeRinging(false);
    setBusy('accept');
    setNotice(null);
    setMuted(false);
    setSpeaker(true);
    setCall({
      phase: 'active',
      orderId,
      callId,
      callerRole,
      callerName: name,
      callerLogoUrl: logo,
    });
    void bringAppToForeground();
    try {
      await ensureMicrophone();
      const session = await acceptInternetCall(callId);
      if (!session.token || !session.livekitUrl) throw new Error('Call audio is not ready.');
      await connectVoice(session.livekitUrl, session.token);
      joined.current = true;
      await setVoiceSpeaker(true);
      setSpeaker(true);
      await markNativeCallActive(callId);
      await dismissIncomingCallNotification();
      pendingByCallId.current.delete(callId);
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
    nativeRinging,
    accept,
    decline,
    hangup,
    toggleMute,
    toggleSpeaker,
    dismissNotice: () => setNotice(null),
  };
}
