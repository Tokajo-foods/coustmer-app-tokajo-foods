import { NotificationSettingsList } from '@/components/notification/NotificationSettingsList';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';

export function PreferencesScreen() {
  return (
    <ProfileFormLayout
      title="Notifications"
      subtitle="Alerts for orders, offers and your account"
      backFallback="/notifications"
    >
      <NotificationSettingsList />
    </ProfileFormLayout>
  );
}
