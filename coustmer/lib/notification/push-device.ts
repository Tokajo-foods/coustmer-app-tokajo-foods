import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { releaseVoipDevice } from '@/lib/call/voip-push';
import { notificationApi } from '@/lib/notification/api';

type NotificationsModule = typeof import('expo-notifications');

const DEVICE_ID_KEY = 'customer_push_device_id';
const UNREGISTER_TIMEOUT_MS = 4000;
const RATE_LIMIT_PAUSE_MS = 60_000;

let inflight: Promise<string | null> | null = null;
let registeredToken: string | null = null;
let pausedUntil = 0;

function isRateLimited(err: unknown): boolean {
  return err instanceof Error && err.message.includes('Too many requests');
}

function easProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;
}

/** Fetches the Expo push token and binds it to the signed-in customer. Returns the token. */
export function registerCustomerPushDevice(N: NotificationsModule): Promise<string | null> {
  if (Date.now() < pausedUntil) return Promise.resolve(registeredToken);
  if (inflight) return inflight;
  inflight = bindPushToken(N).finally(() => {
    inflight = null;
  });
  return inflight;
}

async function bindPushToken(N: NotificationsModule): Promise<string | null> {
  const projectId = easProjectId();
  const expoToken = await N.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  const token = expoToken.data?.trim();
  if (!token || token === registeredToken) return token || null;
  try {
    const device = await notificationApi.registerDevice({
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      app: 'customer',
      appVersion: Constants.expoConfig?.version,
    });
    if (device?.id) await AsyncStorage.setItem(DEVICE_ID_KEY, device.id);
    registeredToken = token;
    return token;
  } catch (err) {
    if (isRateLimited(err)) pausedUntil = Date.now() + RATE_LIMIT_PAUSE_MS;
    throw err;
  }
}

/** notification-service id of this phone's push registration, if it registered. */
export async function getCustomerPushDeviceId(): Promise<string | null> {
  return AsyncStorage.getItem(DEVICE_ID_KEY).catch(() => null);
}

export async function forgetCustomerPushDevice(): Promise<void> {
  registeredToken = null;
  await AsyncStorage.removeItem(DEVICE_ID_KEY).catch(() => undefined);
}

/** Call while still authenticated, so a signed-out phone stops receiving that account's order pushes. */
export async function unregisterCustomerPushDevice(): Promise<void> {
  await releaseVoipDevice();
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
    registeredToken = null;
    await AsyncStorage.removeItem(DEVICE_ID_KEY).catch(() => undefined);
  }
}
