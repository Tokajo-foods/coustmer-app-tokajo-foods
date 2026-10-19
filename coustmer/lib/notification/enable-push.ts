import { Alert, Linking } from 'react-native';

import { loadNotifications } from '@/lib/notification/load-notifications';
import { registerCustomerPushDevice } from '@/lib/notification/push-device';

export type EnablePushResult = 'registered' | 'blocked' | 'unavailable';

/** Asks for OS permission if needed, then registers this phone with notification-service. */
export async function enablePushOnThisPhone(): Promise<EnablePushResult> {
  const N = await loadNotifications();
  if (!N) return 'unavailable';
  let status = (await N.getPermissionsAsync()).status;
  if (status !== 'granted') status = (await N.requestPermissionsAsync()).status;
  if (status !== 'granted') {
    Alert.alert(
      'Notifications are blocked on this phone',
      'Allow notifications for this app in your phone settings to receive them.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open settings', onPress: () => void Linking.openSettings() },
      ]
    );
    return 'blocked';
  }
  const token = await registerCustomerPushDevice(N);
  return token ? 'registered' : 'unavailable';
}
