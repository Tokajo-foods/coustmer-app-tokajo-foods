import { ChevronLeft } from 'lucide-react-native';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable } from '@/components/common/Pressable';
import { SmoothPressable } from '@/components/common/SmoothPressable';
import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
import { NotificationPrefRow } from '@/components/notification/NotificationPrefRow';
import { notificationSettingsStyles as styles } from '@/components/notification/notification-settings-styles';
import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { navigateBack } from '@/lib/motion/navigate-back';
import { enablePushOnThisPhone } from '@/lib/notification/enable-push';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/lib/notification/settings-hooks';
import type { NotificationPreferences } from '@/lib/notification/types';

type Key = keyof NotificationPreferences;

const PUSH_TYPES: Array<{ key: Key; label: string; detail: string }> = [
  { key: 'orders', label: 'Order updates', detail: 'Accepted, preparing, delivery status' },
  { key: 'offers', label: 'Offers & promotions', detail: 'Deals and coupons for your area' },
];

const CHANNELS: Array<{ key: Key; label: string; detail?: string }> = [
  { key: 'sms', label: 'SMS' },
  { key: 'email', label: 'Email' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

type Props = {
  enabled?: boolean;
  embedded?: boolean;
};

export function NotificationSettingsList({ enabled = true, embedded = false }: Props) {
  const router = useRouter();
  const prefs = useNotificationPreferences(enabled);
  const update = useUpdateNotificationPreferences();

  if (prefs.isLoading) {
    const block = (
      <View style={styles.state}>
        <ActivityIndicator color={authTheme.brand} />
      </View>
    );
    return embedded ? block : <View style={styles.card}>{block}</View>;
  }

  if (!prefs.data) {
    const block = (
      <TouchableOpacity style={styles.state} onPress={() => void prefs.refetch()}>
        <Text style={styles.error}>
          Unable to load preferences. {getApiErrorMessage(prefs.error)} Tap to retry.
        </Text>
      </TouchableOpacity>
    );
    return embedded ? block : <View style={styles.card}>{block}</View>;
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
    <View style={embedded ? undefined : styles.wrap}>
      <View style={styles.section}>
        {!embedded ? <Text style={styles.sectionLabel}>Push</Text> : null}
        <View style={styles.card}>
          <NotificationPrefRow
            label="Allow push notifications"
            detail="Required for live order alerts on your phone"
            value={data.push}
            onValueChange={(v) => set('push', v)}
            isLast={false}
          />
          {PUSH_TYPES.map((row, index) => (
            <NotificationPrefRow
              key={row.key}
              label={row.label}
              detail={row.detail}
              value={data.push && data[row.key]}
              disabled={!data.push}
              onValueChange={(v) => set(row.key, v)}
              isLast={index === PUSH_TYPES.length - 1}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        {!embedded ? <Text style={styles.sectionLabel}>Contact</Text> : null}
        <View style={styles.card}>
          {CHANNELS.map((row, index) => (
            <NotificationPrefRow
              key={row.key}
              label={row.label}
              value={data[row.key]}
              onValueChange={(v) => set(row.key, v)}
              isLast={index === CHANNELS.length - 1}
            />
          ))}
        </View>
      </View>

      {!embedded ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Device</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push('/profile/devices')}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.linkLabel}>Manage this phone</Text>
                <Text style={styles.linkHint}>Register or remove push on this device</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Full-screen notification preferences (profile / notifications hub). */
export function NotificationPreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SmoothPressable
          onPress={() => navigateBack(router, '/notifications')}
          style={styles.backBtn}
          pressScale={0.92}
          hitSlop={8}
          accessibilityLabel="Go back"
        >
          <ChevronLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
        </SmoothPressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerGhost} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + APP_BOTTOM_NAV_INSET + 32 },
        ]}
      >
        <NotificationSettingsList />
      </ScrollView>
    </View>
  );
}
