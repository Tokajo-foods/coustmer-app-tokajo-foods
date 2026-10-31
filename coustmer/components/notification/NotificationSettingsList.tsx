import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import { notificationSettingsStyles as styles } from '@/components/notification/notification-settings-styles';
import { ToggleRow } from '@/components/profile/ToggleRow';
import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { enablePushOnThisPhone } from '@/lib/notification/enable-push';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/lib/notification/settings-hooks';
import type { NotificationPreferences } from '@/lib/notification/types';

type Key = keyof NotificationPreferences;

const PUSH_ROWS: Array<{ key: Key; label: string; subtitle: string }> = [
  { key: 'orders', label: 'Order updates', subtitle: 'Accepted, out for delivery, delivered' },
  { key: 'offers', label: 'Offers & deals', subtitle: 'Coupons and promotions' },
];

const OTHER_ROWS: Array<{ key: Key; label: string; subtitle?: string }> = [
  { key: 'sms', label: 'SMS alerts', subtitle: 'Order SMS when enabled by platform' },
  { key: 'email', label: 'Email', subtitle: 'Receipts and account emails' },
  { key: 'whatsapp', label: 'WhatsApp', subtitle: 'Updates on WhatsApp if available' },
];

type Props = {
  enabled?: boolean;
  /** When true, skip outer card (e.g. inside NotificationPrefsCard). */
  embedded?: boolean;
};

/** Server-backed notification switches; each tap saves instantly. */
export function NotificationSettingsList({ enabled = true, embedded = false }: Props) {
  const prefs = useNotificationPreferences(enabled);
  const update = useUpdateNotificationPreferences();

  if (prefs.isLoading) {
    const loading = (
      <View style={styles.state}>
        <ActivityIndicator color={authTheme.brand} />
      </View>
    );
    return embedded ? loading : <View style={styles.card}>{loading}</View>;
  }

  if (!prefs.data) {
    const errorBlock = (
      <TouchableOpacity style={styles.state} onPress={() => void prefs.refetch()}>
        <Text style={styles.error}>
          Could not load notification settings. {getApiErrorMessage(prefs.error)} Tap to retry.
        </Text>
      </TouchableOpacity>
    );
    return embedded ? errorBlock : <View style={styles.card}>{errorBlock}</View>;
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

  const rows = (
    <View>
      <ToggleRow
        showTopBorder={false}
        label="Push notifications"
        subtitle={
          data.push ? 'On for this account' : 'Off — you will not get push notifications'
        }
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

      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>Other channels</Text>
      </View>

      {OTHER_ROWS.map((row, index) => (
        <ToggleRow
          key={row.key}
          showTopBorder={index > 0}
          label={row.label}
          subtitle={row.subtitle}
          value={data[row.key]}
          onValueChange={(v) => set(row.key, v)}
        />
      ))}
    </View>
  );

  if (embedded) return rows;
  return <View style={styles.card}>{rows}</View>;
}
