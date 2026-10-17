import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useUnreadNotificationCount } from '@/lib/notification/hooks';
import { loadNotifications } from '@/lib/notification/load-notifications';

/** Keeps the app-icon badge equal to the inbox unread count; clears it on sign-out. */
export function useBadgeSync(signedIn: boolean): void {
  const unread = useUnreadNotificationCount({ enabled: signedIn });
  const count = signedIn ? (unread.data ?? null) : 0;

  useEffect(() => {
    if (Platform.OS === 'web' || count == null) return;
    void loadNotifications().then((N) => N?.setBadgeCountAsync(count).catch(() => undefined));
  }, [count]);
}
