import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

/** Backend sends customer pushes on this id; keep in sync with notification-service. */
export const ORDER_UPDATES_CHANNEL = 'order-updates';

/** Android 8+: without a high-importance channel, order pushes land silently in the shade. */
export async function ensureOrderUpdatesChannel(N: NotificationsModule): Promise<void> {
  if (Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync(ORDER_UPDATES_CHANNEL, {
    name: 'Order updates',
    description: 'Rider and delivery progress for your orders',
    importance: N.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 250, 150, 250],
    lightColor: '#FF6A00',
    lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
    showBadge: true,
  });
}
