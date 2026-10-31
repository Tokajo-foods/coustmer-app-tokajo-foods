import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { KitchenAlertsBlock } from '@/components/notification/KitchenAlertsBlock';
import { PushPermissionBanner } from '@/components/notification/PushPermissionBanner';
import { hubStyles as styles } from '@/components/notification/notifications-hub-styles';
import type { KitchenAlert } from '@/lib/restaurant/types';

type Filter = 'all' | 'unread';

type HeaderProps = {
  filter: Filter;
  unreadCount: number;
  onFilterChange: (next: Filter) => void;
  showInboxLabel?: boolean;
};

export function NotificationsHubListHeader({
  filter,
  unreadCount,
  onFilterChange,
  showInboxLabel,
}: HeaderProps) {
  return (
    <View style={styles.listHeader}>
      <View style={styles.segmentedControl}>
        <Pressable
          style={[styles.segmentBtn, filter === 'all' && styles.segmentBtnActive]}
          onPress={() => onFilterChange('all')}
        >
          <Text
            style={[styles.segmentText, filter === 'all' && styles.segmentTextActive]}
          >
            All
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentBtn, filter === 'unread' && styles.segmentBtnActive]}
          onPress={() => onFilterChange('unread')}
        >
          <Text
            style={[styles.segmentText, filter === 'unread' && styles.segmentTextActive]}
          >
            Unread{unreadCount > 0 ? ` · ${unreadCount}` : ''}
          </Text>
        </Pressable>
      </View>

      <PushPermissionBanner />

      {showInboxLabel ? <Text style={styles.inboxLabel}>Recent</Text> : null}
    </View>
  );
}

type FooterProps = {
  kitchenAlerts: KitchenAlert[];
  showSettings?: boolean;
  showHint?: boolean;
};

export function NotificationsHubListFooter({
  kitchenAlerts,
  showSettings = true,
  showHint,
}: FooterProps) {
  const router = useRouter();

  return (
    <View style={styles.listFooter}>
      {showHint ? <Text style={styles.hint}>Long-press to delete</Text> : null}

      <KitchenAlertsBlock alerts={kitchenAlerts} />

      {showSettings ? (
        <View style={styles.settingsSection}>
          <Text style={styles.sectionLabel}>Settings</Text>
          <View style={styles.settingsCard}>
            <Pressable
              style={styles.settingsRow}
              onPress={() => router.push('/profile/preferences')}
            >
              <Text style={styles.settingsRowTitle}>Notification preferences</Text>
              <ChevronRight color="#C4C4C4" size={20} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
