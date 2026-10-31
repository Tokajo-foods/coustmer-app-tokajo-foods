import { useRouter } from 'expo-router';
import { CheckCheck, ChevronLeft, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { SmoothPressable } from '@/components/common/SmoothPressable';
import { hubStyles as styles } from '@/components/notification/notifications-hub-styles';
import { authTheme } from '@/constants/auth-theme';
import { navigateBack } from '@/lib/motion/navigate-back';

type Props = {
  subtitle: string;
  unreadCount: number;
  inboxCount: number;
  onMarkAll: () => void;
  onClearAll: () => void;
  markAllPending: boolean;
  clearAllPending: boolean;
};

export function NotificationsHubTopBar({
  subtitle,
  unreadCount,
  inboxCount,
  onMarkAll,
  onClearAll,
  markAllPending,
  clearAllPending,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.topBar}>
      <SmoothPressable
        onPress={() => navigateBack(router, '/home')}
        style={styles.backBtn}
        pressScale={0.92}
        hitSlop={8}
        accessibilityLabel="Go back"
      >
        <ChevronLeft color="#1A1A1A" size={24} strokeWidth={2.5} />
      </SmoothPressable>

      <View style={styles.titleBlock}>
        <Text style={styles.pageTitle}>Notifications</Text>
        <Text style={styles.pageSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.headerActions}>
        <Pressable
          style={styles.headerBtn}
          onPress={onMarkAll}
          disabled={unreadCount <= 0 || markAllPending}
          hitSlop={6}
          accessibilityLabel="Mark all as read"
        >
          {markAllPending ? (
            <ActivityIndicator color={authTheme.brand} size="small" />
          ) : (
            <CheckCheck
              color={unreadCount > 0 ? '#1A1A1A' : '#C4C4C4'}
              size={19}
              strokeWidth={2.2}
            />
          )}
        </Pressable>
        <Pressable
          style={styles.headerBtn}
          onPress={onClearAll}
          disabled={inboxCount === 0 || clearAllPending}
          hitSlop={6}
          accessibilityLabel="Clear all notifications"
        >
          {clearAllPending ? (
            <ActivityIndicator color={authTheme.brand} size="small" />
          ) : (
            <Trash2
              color={inboxCount > 0 ? '#1A1A1A' : '#C4C4C4'}
              size={18}
              strokeWidth={2.2}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}
