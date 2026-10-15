import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { notificationApi } from '@/lib/notification/api';

type NotificationsModule = typeof import('expo-notifications');

const DEVICE_ID_KEY = 'customer_push_device_id';
const UNREGISTER_TIMEOUT_MS = 4000;

function easProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;
}

/** Fetches the Expo push token and binds it to the signed-in customer. Returns the token. */
export async function registerCustomerPushDevice(N: NotificationsModule): Promise<string | null> {
  const projectId = easProjectId();
  const expoToken = await N.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  const token = expoToken.data?.trim();
  if (!token) return null;
  const device = await notificationApi.registerDevice({
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    app: 'customer',
    appVersion: Constants.expoConfig?.version,
  });
  if (device?.id) await AsyncStorage.setItem(DEVICE_ID_KEY, device.id);
  return token;
}

/** Call while still authenticated, so a signed-out phone stops receiving that account's order pushes. */
export async function unregisterCustomerPushDevice(): Promise<void> {
  const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY).catch(() => null);
  if (!deviceId) return;
  try {
    await Promise.race([
      notificationApi.unregisterDevice(deviceId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), UNREGISTER_TIMEOUT_MS)),
    ]);
  } catch {
    // Server drops dead tokens on the next send; sign-out must not block on this.
  } finally {
    await AsyncStorage.removeItem(DEVICE_ID_KEY).catch(() => undefined);
  }
}
