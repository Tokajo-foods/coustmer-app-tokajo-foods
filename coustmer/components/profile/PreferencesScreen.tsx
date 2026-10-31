import { StyleSheet, Text } from 'react-native';

import { NotificationSettingsList } from '@/components/notification/NotificationSettingsList';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { authTheme } from '@/constants/auth-theme';

export function PreferencesScreen() {
  return (
    <ProfileFormLayout
      title="Notification preferences"
      subtitle="Each switch saves instantly — no save button needed"
      backFallback="/notifications"
    >
      <Text style={styles.lead}>
        Choose how we reach you for orders, offers, and account updates.
      </Text>
      <NotificationSettingsList />
    </ProfileFormLayout>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 14,
    lineHeight: 20,
    color: authTheme.textMuted,
    marginBottom: 16,
  },
});
