import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { notificationApi } from '@/lib/notification/api';
import { useAuthStore } from '@/store/auth-store';

/** Registers the customer push token and opens restaurant chat from a tap. */
export function CustomerPushSync() {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    if (!token || Platform.OS === 'web') return;
    let cancelled = false;
    let remove = () => undefined;

    void (async () => {
      try {
        const Notifications = await import('expo-notifications');
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        const current = await Notifications.getPermissionsAsync();
        let status = current.status;
        if (status !== 'granted') {
          status = (await Notifications.requestPermissionsAsync()).status;
        }
        if (status !== 'granted' || cancelled) return;
        const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
        const projectId = extra?.eas?.projectId;
        const expoToken = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );
        const pushToken = expoToken.data?.trim();
        if (!pushToken || cancelled) return;
        await notificationApi.registerDevice({
          token: pushToken,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          app: 'customer',
        });
        if (cancelled) return;
        const sub = Notifications.addNotificationResponseReceivedListener((response) => {
          const raw = response.notification.request.content.data;
          const data = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
          if (String(data.kind ?? '') !== 'restaurant_chat') return;
          const orderId = String(data.orderId ?? '').trim();
          if (!orderId) return;
          router.push({
            pathname: '/orders/[orderId]/restaurant-chat',
            params: { orderId, restaurantName: 'Restaurant' },
          });
        });
        remove = () => sub.remove();
      } catch {
        // Expo Go on Android cannot receive remote push. A dev build can.
      }
    })();

    return () => {
      cancelled = true;
      remove();
    };
  }, [router, token]);

  return null;
}
