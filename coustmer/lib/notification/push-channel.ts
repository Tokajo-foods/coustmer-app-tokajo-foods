import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

/** Ids the backend sends (notification-service `customerPushStyle.ts`); keep in sync. */
export const ORDER_UPDATES_CHANNEL = 'order-updates';
export const OFFERS_CHANNEL = 'offers';
export const LIVE_ORDER_CATEGORY = 'order_live';
export const OFFER_CATEGORY = 'offer';
export const TRACK_ACTION = 'track';
export const VIEW_OFFER_ACTION = 'view_offer';

const BRAND = '#F97316';

/**
 * Android 8+ channels: order progress rings loud, offers stay quiet in the shade.
 * Also registers the "Track order" / "View offer" buttons on both platforms.
 */
export async function ensureCustomerPushSetup(N: NotificationsModule): Promise<void> {
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync(ORDER_UPDATES_CHANNEL, {
      name: 'Order updates',
      description: 'Order confirmation, cooking, rider and delivery progress',
      importance: N.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 150, 250],
      lightColor: BRAND,
      lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
    await N.setNotificationChannelAsync(OFFERS_CHANNEL, {
      name: 'Offers & announcements',
      description: 'Deals, coupons and news from TOKAJO FOODS',
      importance: N.AndroidImportance.DEFAULT,
      sound: 'default',
      lightColor: BRAND,
      lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
  }

  await N.setNotificationCategoryAsync(LIVE_ORDER_CATEGORY, [
    { identifier: TRACK_ACTION, buttonTitle: 'Track order', options: { opensAppToForeground: true } },
  ]);
  await N.setNotificationCategoryAsync(OFFER_CATEGORY, [
    { identifier: VIEW_OFFER_ACTION, buttonTitle: 'View offer', options: { opensAppToForeground: true } },
  ]);
}
