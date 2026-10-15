import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/lib/notification/hooks';

const ROWS = [
  ['orders', 'Order updates'],
  ['offers', 'Offers & promos'],
  ['whatsapp', 'WhatsApp alerts'],
] as const;

export function NotificationPrefsCard({ enabled }: { enabled: boolean }) {
  const prefs = useNotificationPreferences(enabled);
  const updatePrefs = useUpdateNotificationPreferences();
  if (!prefs.data) return null;

  return (
    <View style={styles.prefCard}>
      <Text style={styles.prefTitle}>Notification preferences</Text>
      {ROWS.map(([key, label]) => {
        const value = Boolean(prefs.data?.[key]);
        return (
          <Pressable
            key={key}
            style={styles.prefRow}
            onPress={() => updatePrefs.mutate({ [key]: !value })}
            disabled={updatePrefs.isPending}
          >
            <Text style={styles.prefLabel}>{label}</Text>
            <Text style={[styles.prefValue, value && styles.prefValueOn]}>
              {value ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  prefCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  prefTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  prefLabel: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  prefValue: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '800',
  },
  prefValueOn: {
    color: authTheme.brand,
  },
});
