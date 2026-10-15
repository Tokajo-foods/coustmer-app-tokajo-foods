import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { ensureNativeBindings } from '@/lib/call/call-engine';
import { handleCallPush, handleCallResponse } from '@/lib/call/call-push';
import { onCallSocketEvent, syncCurrentCall } from '@/lib/call/call-remote';
import { useCallStore } from '@/lib/call/call-store';
import { ensureCallNotificationSetup } from '@/lib/call/incoming-call-notify';
import { loadNotifications } from '@/lib/notification/load-notifications';
import { getSocket } from '@/lib/socket/socket';

const POLL_MS = 3_000;
const handledResponses = new Set<string>();

/** Wires sockets, pushes, and the OS call screen into the global call engine. */
export function useCallSync(userId: string | null, enabled: boolean) {
  const callId = useCallStore((s) => s.call?.callId ?? null);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;
    void ensureCallNotificationSetup();
    void ensureNativeBindings();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    let socket: Awaited<ReturnType<typeof getSocket>> | null = null;
    const onInternet = (payload: unknown) => onCallSocketEvent(payload, userId);
    void getSocket().then((next) => {
      if (!alive) return;
      socket = next;
      next.on('call:internet', onInternet as never);
    });
    return () => {
      alive = false;
      socket?.off('call:internet', onInternet as never);
    };
  }, [enabled, userId]);

  useEffect(() => {
    if (!callId) return undefined;
    const timer = setInterval(() => void syncCurrentCall(), POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncCurrentCall();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [callId]);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return undefined;
    const cleanups: Array<() => void> = [];
    void (async () => {
      const N = await loadNotifications();
      if (!N) return;
      const respond = (response: {
        actionIdentifier: string;
        notification: { request: { identifier: string; content: { data: unknown } } };
      }) => {
        const key = `${response.notification.request.identifier}:${response.actionIdentifier}`;
        if (handledResponses.has(key)) return;
        handledResponses.add(key);
        void handleCallResponse(response.actionIdentifier, response.notification.request.content.data);
      };
      const received = N.addNotificationReceivedListener((n) => {
        void handleCallPush(n.request.content.data, 'foreground');
      });
      cleanups.push(() => received.remove());
      const tapped = N.addNotificationResponseReceivedListener(respond);
      cleanups.push(() => tapped.remove());
      const last = await N.getLastNotificationResponseAsync().catch(() => null);
      if (last) respond(last);
    })();
    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [enabled]);
}
