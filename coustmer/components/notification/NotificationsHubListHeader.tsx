import { useRouter } from 'expo-router';
import { ChevronRight, Settings2, Smartphone } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { KitchenAlertsBlock } from '@/components/notification/KitchenAlertsBlock';
import { PushPermissionBanner } from '@/components/notification/PushPermissionBanner';
import { hubStyles as styles } from '@/components/notification/notifications-hub-styles';
import { authTheme } from '@/constants/auth-theme';
import type { KitchenAlert } from '@/lib/restaurant/types';

type Filter = 'all' | 'unread';

type Props = {
  filter: Filter;
  unreadCount: number;
  onFilterChange: (next: Filter) => void;
  kitchenAlerts: KitchenAlert[];
};

export function NotificationsHubListHeader({
  filter,
  unreadCount,
  onFilterChange,
  kitchenAlerts,
}: Props) {
  const router = useRouter();

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
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Text>
        </Pressable>
      </View>

      <PushPermissionBanner />

      <View style={styles.shortcutCard}>
        <Pressable
          style={styles.shortcutRow}
          onPress={() => router.push('/profile/preferences')}
        >
          <View style={styles.shortcutIcon}>
            <Settings2 color={authTheme.brand} size={18} />
          </View>
          <View style={styles.shortcutCopy}>
            <Text style={styles.shortcutTitle}>Notification preferences</Text>
            <Text style={styles.shortcutSub}>Push, offers, SMS, email</Text>
          </View>
          <ChevronRight color={authTheme.textDim} size={20} />
        </Pressable>
        <View style={styles.shortcutDivider} />
        <Pressable
          style={styles.shortcutRow}
          onPress={() => router.push('/profile/devices')}
        >
          <View style={styles.shortcutIcon}>
            <Smartphone color={authTheme.brand} size={18} />
          </View>
          <View style={styles.shortcutCopy}>
            <Text style={styles.shortcutTitle}>This phone</Text>
            <Text style={styles.shortcutSub}>Manage devices that receive alerts</Text>
          </View>
          <ChevronRight color={authTheme.textDim} size={20} />
        </Pressable>
      </View>

      <KitchenAlertsBlock alerts={kitchenAlerts} />
    </View>
  );
}
