import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { isCallPush } from '@/lib/call/call-push';
import { notificationApi } from '@/lib/notification/api';
import { notificationKeys } from '@/lib/notification/hooks';
import { loadNotifications } from '@/lib/notification/load-notifications';
import { ensureCustomerPushSetup } from '@/lib/notification/push-channel';
import { registerCustomerPushDevice } from '@/lib/notification/push-device';
import { routeForNotificationData } from '@/lib/notification/push-route';
import { useBadgeSync } from '@/lib/notification/use-badge-sync';
import { orderKeys } from '@/lib/order/hooks';
import { usePricingSync } from '@/lib/pricing/use-pricing-sync';
import { useSocketEvent } from '@/lib/socket/hooks';
import { useAuthStore } from '@/store/auth-store';

type NotificationResponse = import('expo-notifications').NotificationResponse;

/** Survives re-mounts so a cold-start tap is not replayed when auth state changes. */
const handledResponses = new Set<string>();
/** One notification prompt per app open. A later open asks again only if it is still off. */
let askedNotificationThisLaunch = false;

/**
 * Registers the customer push token, keeps the inbox, badge and server pricing live,
 * and opens the right screen on tap or action button ("Track order", "View offer").
 */
export function CustomerPushSync() {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const router = useRouter();
  const queryClient = useQueryClient();
  /** Sign-in during this session must land on Home, not the last tapped notification. */
  const signedInDuringSession = useRef(false);

  useSocketEvent('notification:new', () => {
    void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  });
  usePricingSync();
  useBadgeSync(Boolean(token));

  useEffect(() => {
    if (!isHydrated) return;
    if (!token || Platform.OS === 'web') {
      if (!token) signedInDuringSession.current = true;
      return;
    }
    const skipLaunchNotification = signedInDuringSession.current;
    let cancelled = false;
    const cleanups: Array<() => void> = [];
    const track = (sub: { remove: () => void }) => {
      if (cancelled) sub.remove();
      else cleanups.push(() => sub.remove());
    };

    const open = (response: NotificationResponse): boolean => {
      const id = `${response.notification.request.identifier}:${response.actionIdentifier}`;
      if (handledResponses.has(id)) return false;
      const data = response.notification.request.content.data;
      const route = routeForNotificationData(data);
      if (!route) return false;
      handledResponses.add(id);
      const notificationId =
        data && typeof data === 'object' ? (data as { notificationId?: unknown }).notificationId : null;
      if (typeof notificationId === 'string' && notificationId) {
        void notificationApi
          .markRead(notificationId)
          .then(() => queryClient.invalidateQueries({ queryKey: notificationKeys.all }))
          .catch(() => undefined);
      }
      router.push(route as never);
      return true;
    };

    const onReceived = (data: unknown) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      const orderId = data && typeof data === 'object' ? (data as { orderId?: unknown }).orderId : null;
      if (typeof orderId === 'string' && orderId) {
        void queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
        void queryClient.invalidateQueries({ queryKey: orderKeys.tracking(orderId) });
        void queryClient.invalidateQueries({ queryKey: orderKeys.active() });
      }
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
              shouldSetBadge: show,
              shouldShowBanner: show,
              shouldShowList: show,
            };
          },
        });
        await ensureCustomerPushSetup(N);

        track(N.addNotificationResponseReceivedListener((res) => { open(res); }));
        track(N.addNotificationReceivedListener((n) => onReceived(n.request.content.data)));
        const last = await N.getLastNotificationResponseAsync().catch(() => null);
        if (last && !cancelled) {
          if (!skipLaunchNotification) open(last);
          await N.clearLastNotificationResponseAsync?.().catch(() => undefined);
        }

        let status = (await N.getPermissionsAsync()).status;
        if (status !== 'granted' && !askedNotificationThisLaunch) {
          askedNotificationThisLaunch = true;
          status = (await N.requestPermissionsAsync()).status;
        }
        if (status !== 'granted' || cancelled) return;

        await registerCustomerPushDevice(N);
        let lastNative = '';
        let wait: ReturnType<typeof setTimeout> | null = null;
        const reRegister = (native?: string) => {
          if (cancelled) return;
          if (native && native === lastNative) return;
          if (native) lastNative = native;
          if (wait) clearTimeout(wait);
          wait = setTimeout(() => {
            wait = null;
            if (cancelled) return;
            void registerCustomerPushDevice(N).catch((err) => console.warn('[push] re-register failed', err));
          }, 1500);
        };
        track(N.addPushTokenListener((deviceToken) => {
          const native = typeof deviceToken?.data === 'string' ? deviceToken.data : '';
          reRegister(native);
        }));
        // Re-bind on foreground so a token the server pruned (or one removed on another phone) comes back.
        track(AppState.addEventListener('change', (state) => {
          if (state === 'active') reRegister();
        }));
      } catch (err) {
        // Expo Go on Android cannot receive remote push. A dev/EAS build with google-services.json can.
        console.warn('[push] customer push registration failed — no order notifications on this device', err);
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [isHydrated, queryClient, router, token]);

  return null;
}
