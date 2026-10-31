import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';
import { notificationVisual } from '@/lib/notification/notification-visual';
import type { AppNotification } from '@/lib/notification/types';

type Props = {
  notification: AppNotification;
  onPress: () => void;
  onDelete: () => void;
};

function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export function NotificationRow({ notification, onPress, onDelete }: Props) {
  const { Icon, tint, label } = notificationVisual(notification);
  const unread = !notification.isRead;
  const orderNumber = text(notification.data?.orderNumber);
  const coupon = text(notification.data?.couponCode);
  const meta = orderNumber ? `${label} · #${orderNumber}` : label;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      style={[styles.card, unread && styles.cardUnread]}
      accessibilityLabel={`${notification.title}. ${notification.body}`}
    >
      {unread ? <View style={styles.unreadBar} /> : null}

      <View style={styles.iconWrap}>
        <Icon color={tint} size={19} strokeWidth={2.2} />
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
          {notification.createdAt ? (
            <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
          ) : null}
        </View>
        <Text style={[styles.title, unread && styles.titleUnread]} numberOfLines={2}>
          {notification.title}
        </Text>
        {notification.body ? (
          <Text style={styles.message} numberOfLines={2}>
            {notification.body}
          </Text>
        ) : null}
        {notification.imageUrl ? (
          <Image source={{ uri: notification.imageUrl }} style={styles.image} contentFit="cover" />
        ) : null}
        {coupon ? (
          <View style={styles.coupon}>
            <Text style={styles.couponText}>Code {coupon}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingLeft: 16,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardUnread: {
    backgroundColor: '#FFFFFF',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 2,
    backgroundColor: authTheme.brand,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  body: { flex: 1, minWidth: 0 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  meta: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.1,
  },
  time: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: '#9CA3AF',
  },
  title: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  titleUnread: {
    fontFamily: fonts.uiBold,
  },
  message: {
    marginTop: 4,
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    color: authTheme.textMuted,
  },
  image: {
    marginTop: 10,
    width: '100%',
    aspectRatio: 2,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  coupon: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  couponText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: '#374151',
    letterSpacing: 0.3,
  },
});
