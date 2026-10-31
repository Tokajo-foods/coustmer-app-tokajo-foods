import { StyleSheet, Text, View } from 'react-native';

import { NotificationSettingsList } from '@/components/notification/NotificationSettingsList';

export function NotificationPrefsCard({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <View style={styles.prefCard}>
      <Text style={styles.prefTitle}>Notification preferences</Text>
      <NotificationSettingsList enabled={enabled} embedded />
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
});
