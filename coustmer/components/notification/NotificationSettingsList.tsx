import {
  BellRing,
  ChevronRight,
  Mail,
  MessageCircle,
  MessageSquare,
  Smartphone,
  ShoppingBag,
  Tag,
} from 'lucide-react-native';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Pressable } from '@/components/common/Pressable';
import { NotificationPrefRow } from '@/components/notification/NotificationPrefRow';
import { notificationSettingsStyles as styles } from '@/components/notification/notification-settings-styles';
import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { enablePushOnThisPhone } from '@/lib/notification/enable-push';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/lib/notification/settings-hooks';
import type { NotificationPreferences } from '@/lib/notification/types';

type Key = keyof NotificationPreferences;

const PUSH_CHILDREN: Array<{
  key: Key;
  label: string;
  subtitle: string;
  Icon: typeof ShoppingBag;
  iconTint: string;
  iconBg: string;
}> = [
  {
    key: 'orders',
    label: 'Order updates',
    subtitle: 'Accepted, preparing, out for delivery, delivered',
    Icon: ShoppingBag,
    iconTint: '#EA580C',
    iconBg: '#FFEDD5',
  },
  {
    key: 'offers',
    label: 'Offers & deals',
    subtitle: 'Coupons, cashback and limited-time promos',
    Icon: Tag,
    iconTint: '#9333EA',
    iconBg: '#F3E8FF',
  },
];

const CHANNEL_ROWS: Array<{
  key: Key;
  label: string;
  subtitle: string;
  Icon: typeof Mail;
  iconTint: string;
  iconBg: string;
}> = [
  {
    key: 'sms',
    label: 'SMS',
    subtitle: 'Text alerts for important order moments',
    Icon: MessageSquare,
    iconTint: '#0284C7',
    iconBg: '#E0F2FE',
  },
  {
    key: 'email',
    label: 'Email',
    subtitle: 'Receipts, refunds and account updates',
    Icon: Mail,
    iconTint: '#4F46E5',
    iconBg: '#EEF2FF',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    subtitle: 'Messages when WhatsApp delivery is enabled',
    Icon: MessageCircle,
    iconTint: '#16A34A',
    iconBg: '#DCFCE7',
  },
];

type Props = {
  enabled?: boolean;
  embedded?: boolean;
  showDeviceLink?: boolean;
  showStatusBanner?: boolean;
};

/** Account notification preferences — instant save per toggle. */
export function NotificationSettingsList({
  enabled = true,
  embedded = false,
  showDeviceLink = !embedded,
  showStatusBanner = !embedded,
}: Props) {
  const router = useRouter();
  const prefs = useNotificationPreferences(enabled);
  const update = useUpdateNotificationPreferences();

  if (prefs.isLoading) {
    const loading = (
      <View style={styles.state}>
        <ActivityIndicator color={authTheme.brand} size="large" />
      </View>
    );
    return embedded ? loading : <View style={styles.card}>{loading}</View>;
  }

  if (!prefs.data) {
    const errorBlock = (
      <TouchableOpacity style={styles.state} onPress={() => void prefs.refetch()}>
        <Text style={styles.error}>
          Could not load settings. {getApiErrorMessage(prefs.error)} Tap to retry.
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

  const content = (
    <View style={embedded ? undefined : styles.wrap}>
      {showStatusBanner ? (
        <View style={[styles.statusBanner, !data.push && styles.statusBannerOff]}>
          <View style={[styles.statusDot, !data.push && styles.statusDotOff]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusText}>
              {data.push ? 'Push alerts are on' : 'Push alerts are off'}
            </Text>
            <Text style={styles.statusHint}>
              {data.push
                ? 'You can fine-tune categories below.'
                : 'Turn on push to get live order updates on your phone.'}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        {!embedded ? <Text style={styles.sectionTitle}>On your phone</Text> : null}
        <View style={styles.card}>
          <NotificationPrefRow
            Icon={BellRing}
            label="Push notifications"
            subtitle={data.push ? 'Enabled for your account' : 'Disabled for your account'}
            value={data.push}
            onValueChange={(v) => set('push', v)}
            isLast={false}
          />
          {PUSH_CHILDREN.map((row, index) => (
            <NotificationPrefRow
              key={row.key}
              Icon={row.Icon}
              iconTint={row.iconTint}
              iconBg={row.iconBg}
              label={row.label}
              subtitle={row.subtitle}
              value={data.push && data[row.key]}
              disabled={!data.push}
              onValueChange={(v) => set(row.key, v)}
              isLast={index === PUSH_CHILDREN.length - 1}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        {!embedded ? <Text style={styles.sectionTitle}>Other channels</Text> : null}
        <View style={styles.card}>
          {CHANNEL_ROWS.map((row, index) => (
            <NotificationPrefRow
              key={row.key}
              Icon={row.Icon}
              iconTint={row.iconTint}
              iconBg={row.iconBg}
              label={row.label}
              subtitle={row.subtitle}
              value={data[row.key]}
              onValueChange={(v) => set(row.key, v)}
              isLast={index === CHANNEL_ROWS.length - 1}
            />
          ))}
        </View>
      </View>

      {showDeviceLink ? (
        <Pressable
          style={styles.deviceLink}
          onPress={() => router.push('/profile/devices')}
        >
          <View style={styles.deviceLinkIcon}>
            <Smartphone color={authTheme.brand} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.deviceLinkTitle}>This phone</Text>
            <Text style={styles.deviceLinkSub}>Register or remove devices for push</Text>
          </View>
          <ChevronRight color={authTheme.textDim} size={20} />
        </Pressable>
      ) : null}

      {!embedded ? (
        <Text style={styles.footnote}>Changes save automatically when you toggle a switch.</Text>
      ) : null}
    </View>
  );

  return content;
}
