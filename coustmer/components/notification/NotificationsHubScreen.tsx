import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { ScreenHeader } from '@/components/common/ScreenHeader';
import {
  ErrorView,
  LoadingView,
} from '@/components/common/StateViews';
import { KitchenAlertsBlock } from '@/components/notification/KitchenAlertsBlock';
import { NotificationPrefsCard } from '@/components/notification/NotificationPrefsCard';
import { NotificationRow } from '@/components/notification/NotificationRow';
import { PushPermissionBanner } from '@/components/notification/PushPermissionBanner';
import { SignedOutInbox } from '@/components/notification/SignedOutInbox';
import { hubStyles as styles } from '@/components/notification/notifications-hub-styles';
import { authTheme } from '@/constants/auth-theme';
import { getApiErrorMessage } from '@/lib/errors';
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
  const insets = useSafeAreaInsets();
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

  const subtitle = useMemo(() => {
    if (count > 0) return `${count} unread`;
    if (notifications.length > 0) return 'You are all caught up';
    return 'Order updates & offers';
  }, [count, notifications.length]);

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

  if (!authed) {
    return (
      <View style={[styles.safe, { paddingTop: Math.max(insets.top, 32) }]}>
        <View style={styles.container}>
          <ScreenHeader title="Notifications" />
          <SignedOutInbox />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.safe, { paddingTop: Math.max(insets.top, 32) }]}
    >
      <View style={styles.container}>
        <ScreenHeader
          title="Notifications"
          subtitle={subtitle}
          right={
            <View style={styles.headerActions}>
              <Pressable
                style={styles.headerBtn}
                onPress={onMarkAll}
                disabled={count <= 0 || markAllRead.isPending}
                hitSlop={6}
                accessibilityLabel="Mark all as read"
              >
                {markAllRead.isPending ? (
                  <ActivityIndicator color={authTheme.brand} size="small" />
                ) : (
                  <CheckCheck
                    color={count > 0 ? authTheme.brand : authTheme.textDim}
                    size={18}
                  />
                )}
              </Pressable>
              <Pressable
                style={styles.headerBtn}
                onPress={onClearAll}
                disabled={notifications.length === 0 || clearAll.isPending}
                hitSlop={6}
                accessibilityLabel="Clear all notifications"
              >
                {clearAll.isPending ? (
                  <ActivityIndicator color={authTheme.brand} size="small" />
                ) : (
                  <Trash2
                    color={
                      notifications.length > 0
                        ? authTheme.brand
                        : authTheme.textDim
                    }
                    size={18}
                  />
                )}
              </Pressable>
            </View>
          }
        />

        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.segmentBtn, filter === 'all' && styles.segmentBtnActive]}
            onPress={() => changeFilter('all')}
          >
            <Text
              style={[
                styles.segmentText,
                filter === 'all' && styles.segmentTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, filter === 'unread' && styles.segmentBtnActive]}
            onPress={() => changeFilter('unread')}
          >
            <Text
              style={[
                styles.segmentText,
                filter === 'unread' && styles.segmentTextActive,
              ]}
            >
              Unread{count > 0 ? ` (${count})` : ''}
            </Text>
          </Pressable>
        </View>

        <PushPermissionBanner />

        <NotificationPrefsCard enabled={authed} />

        <KitchenAlertsBlock alerts={activeAlerts} />

        {listQuery.isLoading ? (
          <LoadingView label="Loading notifications…" />
        ) : listQuery.isError ? (
          <ErrorView
            message={getApiErrorMessage(listQuery.error)}
            onRetry={() => listQuery.refetch()}
          />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              {filter === 'unread' ? (
                <BellOff color={authTheme.brand} size={32} strokeWidth={2} />
              ) : (
                <Bell color={authTheme.brand} size={32} strokeWidth={2} />
              )}
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread'
                ? 'You are all caught up! New order updates will show here.'
                : 'Order status, exclusive offers, and account alerts will appear here.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={pullRefreshing}
                onRefresh={() => void onPullRefresh()}
                tintColor={authTheme.brand}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <NotificationRow
                notification={item}
                onPress={() => onOpen(item)}
                onDelete={() => onDelete(item)}
              />
            )}
            ListFooterComponent={
              listQuery.isFetchingMore ? (
                <ActivityIndicator color={authTheme.brand} style={{ marginVertical: 12 }} />
              ) : (
                <Text style={styles.hint}>Long-press a notification to delete</Text>
              )
            }
          />
        )}
      </View>
    </View>
  );
}
