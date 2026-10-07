import { Platform } from 'react-native';

const CHANNEL = 'tokajo-calls';
const CATEGORY = 'internet_call';
const NOTIF_ID = 'tokajo-incoming-internet-call';
/** Must match the file registered under expo-notifications `sounds`. */
const RINGTONE = 'incoming-call.wav';

type IncomingPayload = {
  orderId: string;
  callId: string;
  callerRole: string;
  callerName?: string;
  callerLogoUrl?: string | null;
};

async function loadNotifications() {
  if (Platform.OS === 'web') return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

/** High-priority call channel with custom ringtone + Accept / Decline. */
export async function ensureCallNotificationSetup(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Incoming calls',
      importance: Notifications.AndroidImportance.MAX,
      sound: RINGTONE,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableVibrate: true,
      enableLights: true,
      lightColor: '#FF6A00',
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.NOTIFICATION_RINGTONE,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
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
      title: `${who} is calling`,
      body: 'Incoming Tokajo order call',
      sound: RINGTONE,
      categoryIdentifier: CATEGORY,
      interruptionLevel: 'timeSensitive',
      data: {
        kind: 'internet_call',
        orderId: input.orderId,
        callId: input.callId,
        callerRole: input.callerRole,
        callerName: who,
        callerLogoUrl: input.callerLogoUrl?.trim() || '',
        channelId: CHANNEL,
      },
      ...(Platform.OS === 'android'
        ? {
            channelId: CHANNEL,
            priority: Notifications.AndroidNotificationPriority.MAX,
            sticky: true,
            autoDismiss: false,
          }
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
