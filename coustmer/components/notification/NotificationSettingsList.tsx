import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ToggleRow } from '@/components/profile/ToggleRow';
import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/lib/notification/settings-hooks';
import { enablePushOnThisPhone } from '@/lib/notification/enable-push';
import type { NotificationPreferences } from '@/lib/notification/types';

type Key = keyof NotificationPreferences;

const PUSH_ROWS: Array<{ key: Key; label: string; subtitle: string }> = [
  { key: 'orders', label: 'Order updates', subtitle: 'Accepted, out for delivery, delivered' },
  { key: 'offers', label: 'Offers & deals', subtitle: 'Coupons and promotions' },
];

const OTHER_ROWS: Array<{ key: Key; label: string }> = [
  { key: 'sms', label: 'SMS alerts' },
  { key: 'email', label: 'Email' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

/** Server-backed notification switches (notification-service `/preferences`); each tap saves instantly. */
export function NotificationSettingsList({ enabled = true }: { enabled?: boolean }) {
  const prefs = useNotificationPreferences(enabled);
  const update = useUpdateNotificationPreferences();

  if (prefs.isLoading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={authTheme.brand} />
      </View>
    );
  }
  if (!prefs.data) {
    return (
      <TouchableOpacity style={styles.state} onPress={() => void prefs.refetch()}>
        <Text style={styles.error}>
          Could not load notification settings. {getApiErrorMessage(prefs.error)} Tap to retry.
        </Text>
      </TouchableOpacity>
    );
  }

  const data = prefs.data;
  const set = (key: Key, value: boolean) => {
    update.mutate(
      { [key]: value },
      {
        onSuccess: () => {
          if (key === 'push' && value) void enablePushOnThisPhone().catch(() => null);
        },
        onError: (e) => Alert.alert('Could not update', getApiErrorMessage(e)),
      }
    );
  };

  return (
    <View>
      <ToggleRow
        label="Push notifications"
        subtitle={data.push ? 'On for this account' : 'Off — you will not get any push notifications'}
        value={data.push}
        onValueChange={(v) => set('push', v)}
      />
      {PUSH_ROWS.map((row) => (
        <ToggleRow
          key={row.key}
          label={row.label}
          subtitle={row.subtitle}
          value={data.push && data[row.key]}
          disabled={!data.push}
          onValueChange={(v) => set(row.key, v)}
        />
      ))}
      {OTHER_ROWS.map((row) => (
        <ToggleRow
          key={row.key}
          label={row.label}
          value={data[row.key]}
          onValueChange={(v) => set(row.key, v)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  error: {
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
  },
});
