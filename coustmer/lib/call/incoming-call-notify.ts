import { Platform } from 'react-native';

const CHANNEL = 'tokajo-calls';
const CATEGORY = 'internet_call';
const NOTIF_ID = 'tokajo-incoming-internet-call';

type IncomingPayload = {
  orderId: string;
  callId: string;
  callerRole: string;
  callerName?: string;
};

async function loadNotifications() {
  if (Platform.OS === 'web') return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

/** Call channel + Accept / Decline actions (Android + iOS notification actions). */
export async function ensureCallNotificationSetup(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Calls',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 400, 200, 400],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableVibrate: true,
    });
  }
  await Notifications.setNotificationCategoryAsync(CATEGORY, [
    {
      identifier: 'ACCEPT',
      buttonTitle: 'Accept',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'DECLINE',
      buttonTitle: 'Decline',
      options: { isDestructive: true, opensAppToForeground: false },
    },
  ]);
}

export async function presentIncomingCallNotification(input: IncomingPayload): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  await ensureCallNotificationSetup();
  const who = input.callerName?.trim()
    || (input.callerRole === 'restaurant' ? 'Restaurant' : 'Delivery partner');
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_ID,
    content: {
      title: 'Incoming call',
      body: `${who} is calling`,
      sound: true,
      categoryIdentifier: CATEGORY,
      data: {
        kind: 'internet_call',
        orderId: input.orderId,
        callId: input.callId,
        callerRole: input.callerRole,
        channelId: CHANNEL,
      },
      ...(Platform.OS === 'android'
        ? { channelId: CHANNEL, priority: Notifications.AndroidNotificationPriority.MAX }
        : {}),
    },
    trigger: null,
  });
}

export async function dismissIncomingCallNotification(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  await Notifications.dismissNotificationAsync(NOTIF_ID).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(NOTIF_ID).catch(() => undefined);
}
