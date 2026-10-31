import { NotificationSettingsList } from '@/components/notification/NotificationSettingsList';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { ProfileMenuSection } from '@/components/profile/ProfileMenuSection';

export function PreferencesScreen() {
  return (
    <ProfileFormLayout
      title="Notification preferences"
      subtitle="Push, offers, SMS, email & WhatsApp"
    >
      <ProfileMenuSection title="Notifications">
        <NotificationSettingsList />
      </ProfileMenuSection>
    </ProfileFormLayout>
  );
}
