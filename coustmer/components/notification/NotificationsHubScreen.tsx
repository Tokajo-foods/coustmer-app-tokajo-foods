import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationsHubEmpty } from '@/components/notification/NotificationsHubEmpty';
import { NotificationsHubListFooter, NotificationsHubListHeader } from '@/components/notification/NotificationsHubListHeader';
import { NotificationsHubTopBar } from '@/components/notification/NotificationsHubTopBar';
import { NotificationRow } from '@/components/notification/NotificationRow';
import { SignedOutInbox } from '@/components/notification/SignedOutInbox';
import { hubStyles as styles } from '@/components/notification/notifications-hub-styles';
import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
import { PREMIUM_LIST } from '@/lib/motion/premium';
import {
  useClearAllNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
} from '@/lib/notification/hooks';
import { useInboxPages } from '@/lib/notification/inbox-pages';
import { routeForNotificationData } from '@/lib/notification/push-route';
import type { AppNotification } from '@/lib/notification/types';
import { useKitchenAlerts } from '@/lib/restaurant/hooks';
import { useAuthStore } from '@/store/auth-store';

type Filter = 'all' | 'unread';

export function NotificationsHubScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const token = useAuthStore((s) => s.token);
  const authed = Boolean(token);
  const kitchenAlerts = useKitchenAlerts({ enabled: authed });
  const activeAlerts = (kitchenAlerts.data ?? []).filter(
    (a) => a.active !== false
  );

  const [pageCount, setPageCount] = useState(1);
  const listQuery = useInboxPages(pageCount, {
    unread: filter === 'unread' ? true : undefined,
    enabled: authed,
    refetchInterval: 45_000,
  });
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const unreadCount = useUnreadNotificationCount({
    refetchInterval: 12_000,
    enabled: authed,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteOne = useDeleteNotification();
  const clearAll = useClearAllNotifications();

  const notifications = listQuery.notifications;
  const changeFilter = (next: Filter) => {
    setFilter(next);
    setPageCount(1);
  };
  const loadMore = () => {
    if (listQuery.hasMore && !listQuery.isFetchingMore) setPageCount((n) => n + 1);
  };
  const onPullRefresh = async () => {
    setPullRefreshing(true);
    try {
      await Promise.all([listQuery.refetch(), unreadCount.refetch(), kitchenAlerts.refetch()]);
    } finally {
      setPullRefreshing(false);
    }
  };
  const count = unreadCount.data ?? 0;

  const onOpen = (item: AppNotification) => {
    if (!item.isRead) {
      markRead.mutate(item.id);
    }
    const route = routeForNotificationData(item.data);
    if (route && route.pathname !== '/notifications') router.push(route as never);
  };

  const onDelete = (item: AppNotification) => {
    Alert.alert('Delete notification?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteOne.mutate(item.id),
      },
    ]);
  };

  const onMarkAll = () => {
    if (count <= 0) return;
    markAllRead.mutate();
  };

  const onClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Clear all notifications?',
      'This permanently removes every notification from your inbox.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: () => clearAll.mutate(),
        },
      ]
    );
  };

  const hasInboxItems = notifications.length > 0;
  const listHeader = useMemo(
    () => (
      <NotificationsHubListHeader
        filter={filter}
        unreadCount={count}
        onFilterChange={changeFilter}
        showInboxLabel={hasInboxItems && !listQuery.isLoading}
      />
    ),
    [filter, count, hasInboxItems, listQuery.isLoading]
  );

  const listFooter = useMemo(
    () => (
      <NotificationsHubListFooter
        kitchenAlerts={activeAlerts}
        showHint={notifications.length > 0 && !listQuery.isFetchingMore}
      />
    ),
    [activeAlerts, notifications.length, listQuery.isFetchingMore]
  );

  if (!authed) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.signedOutHeader}>
            <Text style={styles.signedOutTitle}>Notifications</Text>
          </View>
          <SignedOutInbox />
        </View>
      </SafeAreaView>
    );
  }

  const showEmpty =
    listQuery.isLoading ||
    listQuery.isError ||
    notifications.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <NotificationsHubTopBar
          unreadCount={count}
          inboxCount={notifications.length}
          onMarkAll={onMarkAll}
          onClearAll={onClearAll}
          markAllPending={markAllRead.isPending}
          clearAllPending={clearAll.isPending}
        />

        <FlatList
          style={styles.list}
          data={showEmpty ? [] : notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          {...PREMIUM_LIST}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <NotificationsHubEmpty
              filter={filter}
              loading={listQuery.isLoading}
              isError={listQuery.isError}
              errorMessage={getApiErrorMessage(listQuery.error)}
              onRetry={() => listQuery.refetch()}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={() => void onPullRefresh()}
              tintColor={authTheme.brand}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          renderItem={({ item }) => (
            <NotificationRow
              notification={item}
              onPress={() => onOpen(item)}
              onDelete={() => onDelete(item)}
            />
          )}
          ListFooterComponent={
            listQuery.isFetchingMore ? (
              <View>
                <ActivityIndicator color={authTheme.brand} style={{ marginVertical: 16 }} />
                {listFooter}
              </View>
            ) : (
              listFooter
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
