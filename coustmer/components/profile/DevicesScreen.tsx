import { Pressable } from '@/components/common/Pressable';
import { Smartphone, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { EmptyView, ErrorView, LoadingView } from '@/components/common/StateViews';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { enablePushOnThisPhone } from '@/lib/notification/enable-push';
import { notificationKeys } from '@/lib/notification/hooks';
import {
  useNotificationDevices,
  useUnregisterNotificationDevice,
} from '@/lib/notification/settings-hooks';
import type { NotificationDevice } from '@/lib/notification/types';

type Banner = { message: string; type: 'error' | 'success' } | null;

function deviceLabel(device: NotificationDevice): string {
  if (device.platform === 'ios') return 'iPhone';
  if (device.platform === 'android') return 'Android phone';
  return 'Web browser';
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Phones that receive this account's push notifications (notification-service `/devices`). */
export function DevicesScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useNotificationDevices();
  const removeDevice = useUnregisterNotificationDevice();
  const [banner, setBanner] = useState<Banner>(null);
  const [enabling, setEnabling] = useState(false);

  const devices = data?.devices ?? [];
  const currentId = data?.currentId ?? null;
  const thisPhoneRegistered = Boolean(currentId && devices.some((d) => d.id === currentId));

  const enableThisPhone = async () => {
    setEnabling(true);
    setBanner(null);
    try {
      const result = await enablePushOnThisPhone();
      if (result === 'registered') {
        setBanner({ message: 'This phone will now receive notifications.', type: 'success' });
      } else if (result === 'unavailable') {
        setBanner({ message: 'Push notifications are not available on this build.', type: 'error' });
      }
    } catch (e) {
      setBanner({ message: getApiErrorMessage(e), type: 'error' });
    } finally {
      setEnabling(false);
      void queryClient.invalidateQueries({ queryKey: notificationKeys.devices() });
    }
  };

  const confirmRemove = (device: NotificationDevice) => {
    const isThis = device.id === currentId;
    Alert.alert(
      'Remove device?',
      isThis
        ? 'This phone will stop receiving notifications until you turn them on again.'
        : 'That device will stop receiving notifications for this account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            removeDevice.mutate(device.id, {
              onSuccess: () => setBanner({ message: 'Device removed.', type: 'success' }),
              onError: (e) => setBanner({ message: getApiErrorMessage(e), type: 'error' }),
            }),
        },
      ]
    );
  };

  return (
    <ProfileFormLayout
      title="Notification devices"
      subtitle="Phones that receive your order updates"
      banner={banner}
      onSave={thisPhoneRegistered ? undefined : enableThisPhone}
      saveLabel={enabling ? 'Turning on…' : 'Turn on for this phone'}
      saving={enabling}
    >
      {isLoading ? (
        <LoadingView label="Loading devices…" />
      ) : isError ? (
        <ErrorView message={getApiErrorMessage(error)} onRetry={refetch} />
      ) : !devices.length ? (
        <EmptyView
          icon={<Smartphone color={authTheme.textDim} size={40} />}
          title="No devices yet"
          subtitle="Turn on notifications for this phone to get order updates."
        />
      ) : (
        <View style={styles.list}>
          {devices.map((device) => {
            const isThis = device.id === currentId;
            const added = formatDate(device.createdAt);
            const removing = removeDevice.isPending && removeDevice.variables === device.id;
            return (
              <View key={device.id} style={styles.card}>
                <View style={styles.iconWrap}>
                  <Smartphone color={authTheme.brand} size={20} />
                </View>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{deviceLabel(device)}</Text>
                    {isThis ? <Text style={styles.badge}>This phone</Text> : null}
                  </View>
                  {added ? <Text style={styles.meta}>Added {added}</Text> : null}
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => confirmRemove(device)}
                  disabled={removeDevice.isPending}
                  accessibilityLabel={`Remove ${deviceLabel(device)}`}
                >
                  {removing ? (
                    <ActivityIndicator color={authTheme.error} size="small" />
                  ) : (
                    <Trash2 color={authTheme.error} size={18} />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </ProfileFormLayout>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: authTheme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: authTheme.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: authTheme.text, fontSize: 15, fontWeight: '700' },
  badge: {
    color: authTheme.brand,
    backgroundColor: authTheme.brandSoft,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  meta: { color: authTheme.textMuted, fontSize: 12, marginTop: 2 },
  removeButton: { padding: 8 },
});
