import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

let cached: NotificationsModule | null | undefined;

/**
 * Loads expo-notifications only when this binary includes the native module.
 * Importing the package otherwise throws ExpoPushTokenManager at startup.
 */
export async function loadNotifications(): Promise<NotificationsModule | null> {
  if (cached !== undefined) return cached;
  if (Platform.OS === 'web') {
    cached = null;
    return null;
  }
  try {
    if (!requireOptionalNativeModule('ExpoPushTokenManager')) {
      cached = null;
      return null;
    }
    cached = await import('expo-notifications');
    return cached;
  } catch {
    cached = null;
    return null;
  }
}
