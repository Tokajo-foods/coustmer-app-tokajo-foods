import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { isCallPush } from '@/lib/call/call-push';
import { notificationKeys } from '@/lib/notification/hooks';
import { loadNotifications } from '@/lib/notification/load-notifications';
import { ensureOrderUpdatesChannel } from '@/lib/notification/push-channel';
import { registerCustomerPushDevice } from '@/lib/notification/push-device';
import { routeForNotificationData } from '@/lib/notification/push-route';
import { usePricingSync } from '@/lib/pricing/use-pricing-sync';
import { useSocketEvent } from '@/lib/socket/hooks';
import { useAuthStore } from '@/store/auth-store';

type NotificationResponse = import('expo-notifications').NotificationResponse;

/** Survives re-mounts so a cold-start tap is not replayed when auth state changes. */
const handledResponses = new Set<string>();

/**
 * Registers the customer push token, keeps the inbox and server pricing live,
 * and opens the right screen on tap.
 */
export function CustomerPushSync() {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const queryClient = useQueryClient();

  useSocketEvent('notification:new', () => {
    void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  });
  usePricingSync();

  useEffect(() => {
    if (!token || Platform.OS === 'web') return;
    let cancelled = false;
    const cleanups: Array<() => void> = [];
    const track = (sub: { remove: () => void }) => {
      if (cancelled) sub.remove();
      else cleanups.push(() => sub.remove());
    };

    const open = (response: NotificationResponse): boolean => {
      const id = response.notification.request.identifier;
      if (handledResponses.has(id)) return false;
      const route = routeForNotificationData(response.notification.request.content.data);
      if (!route) return false;
      handledResponses.add(id);
      router.push(route as never);
      return true;
    };

    void (async () => {
      try {
        const N = await loadNotifications();
        if (!N || cancelled) return;
        N.setNotificationHandler({
          handleNotification: async (n) => {
            const show = !isCallPush(n.request.content.data);
            return {
              shouldShowAlert: show,
              shouldPlaySound: show,
              shouldSetBadge: false,
              shouldShowBanner: show,
              shouldShowList: show,
            };
          },
        });
        await ensureOrderUpdatesChannel(N);

        track(N.addNotificationResponseReceivedListener((res) => { open(res); }));
        track(N.addNotificationReceivedListener(() => {
          void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }));
        const last = await N.getLastNotificationResponseAsync().catch(() => null);
        if (last && !cancelled && open(last)) {
          await N.clearLastNotificationResponseAsync?.().catch(() => undefined);
        }

        let status = (await N.getPermissionsAsync()).status;
        if (status !== 'granted') status = (await N.requestPermissionsAsync()).status;
        if (status !== 'granted' || cancelled) return;

        await registerCustomerPushDevice(N);
        track(N.addPushTokenListener(() => {
          void registerCustomerPushDevice(N).catch(() => undefined);
        }));
      } catch {
        // Expo Go on Android cannot receive remote push. A dev build can.
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [queryClient, router, token]);

  return null;
}
