import { Platform } from 'react-native';

import { loadNotifications } from '@/lib/notification/load-notifications';

const CHANNEL = 'tokajo-calls';
const CATEGORY = 'internet_call';
const NOTIF_ID = 'tokajo-incoming-internet-call';
/** Must match the file registered under expo-notifications `sounds`. */
const RINGTONE = 'incoming_call.wav';

type IncomingPayload = {
  orderId: string;
  callId: string;
  callerRole: string;
  callerName?: string;
  callerLogoUrl?: string | null;
};

/** High-priority call channel with custom ringtone + Accept / Decline. */
export async function ensureCallNotificationSetup(): Promise<void> {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications?.setNotificationChannelAsync || !Notifications.setNotificationCategoryAsync) {
      return;
    }
    const importance = Notifications.AndroidImportance?.MAX;
    const visibility = Notifications.AndroidNotificationVisibility?.PUBLIC;
    const usage = Notifications.AndroidAudioUsage?.NOTIFICATION_RINGTONE;
    const contentType = Notifications.AndroidAudioContentType?.SONIFICATION;
    if (Platform.OS === 'android') {
      if (importance == null || visibility == null || usage == null || contentType == null) return;
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Incoming calls',
        importance,
        sound: RINGTONE,
        vibrationPattern: [0, 500, 250, 500, 250, 500],
        lockscreenVisibility: visibility,
        bypassDnd: true,
        enableVibrate: true,
        enableLights: true,
        lightColor: '#FF6A00',
        audioAttributes: { usage, contentType },
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
  } catch {
    // This binary has no notification native module (Expo Go or an old dev client).
  }
}

export async function presentIncomingCallNotification(input: IncomingPayload): Promise<void> {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications?.scheduleNotificationAsync) return;
    await ensureCallNotificationSetup();
    const who = input.callerName?.trim()
      || (input.callerRole === 'restaurant' ? 'Restaurant' : 'Delivery partner');
    const priority = Notifications.AndroidNotificationPriority?.MAX;
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
              ...(priority != null ? { priority } : {}),
              sticky: true,
              autoDismiss: false,
            }
          : {}),
      },
      trigger: null,
    });
  } catch {
    // Notification native module is missing in this binary.
  }
}

export async function dismissIncomingCallNotification(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  await Notifications.dismissNotificationAsync(NOTIF_ID).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(NOTIF_ID).catch(() => undefined);
}
