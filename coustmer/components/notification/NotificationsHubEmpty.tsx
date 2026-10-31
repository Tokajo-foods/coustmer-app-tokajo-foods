import { Bell, BellOff } from 'lucide-react-native';
import { Text, View } from 'react-native';

import {
  ErrorView,
  LoadingView,
} from '@/components/common/StateViews';
import { hubStyles as styles } from '@/components/notification/notifications-hub-styles';

type Filter = 'all' | 'unread';

type Props = {
  filter: Filter;
  loading: boolean;
  isError: boolean;
  errorMessage: string;
  onRetry: () => void;
};

export function NotificationsHubEmpty({
  filter,
  loading,
  isError,
  errorMessage,
  onRetry,
}: Props) {
  if (loading) {
    return <LoadingView label="Loading notifications…" />;
  }
  if (isError) {
    return <ErrorView message={errorMessage} onRetry={onRetry} />;
  }

  return (
    <View style={styles.emptyInline}>
      <View style={styles.emptyIconWrap}>
        {filter === 'unread' ? (
          <BellOff color="#6B7280" size={26} strokeWidth={2} />
        ) : (
          <Bell color="#6B7280" size={26} strokeWidth={2} />
        )}
      </View>
      <Text style={styles.emptyTitle}>
        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'unread'
          ? 'You are all caught up.'
          : 'Order and account updates will appear here.'}
      </Text>
    </View>
  );
}
