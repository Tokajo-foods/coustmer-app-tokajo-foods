import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';
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
  const { Icon, tint, bg, label } = notificationVisual(notification);
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
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Icon color={tint} size={20} strokeWidth={2.2} />
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: tint }]} numberOfLines={1}>
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
          <Text style={styles.message} numberOfLines={3}>
            {notification.body}
          </Text>
        ) : null}
        {notification.imageUrl ? (
          <Image source={{ uri: notification.imageUrl }} style={styles.image} contentFit="cover" />
        ) : null}
        {coupon ? (
          <View style={styles.coupon}>
            <Text style={styles.couponText}>Use code {coupon}</Text>
          </View>
        ) : null}
      </View>

      {unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  cardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    borderWidth: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  meta: { flex: 1, fontSize: 11, fontWeight: '700', letterSpacing: 0.2, textTransform: 'uppercase' },
  time: { fontSize: 11, fontWeight: '600', color: authTheme.textDim },
  title: { fontSize: 14.5, fontWeight: '700', color: authTheme.text, lineHeight: 20 },
  titleUnread: { fontWeight: '800' },
  message: { marginTop: 3, fontSize: 13, lineHeight: 18, color: authTheme.textMuted },
  image: { marginTop: 10, width: '100%', aspectRatio: 2, borderRadius: 12, backgroundColor: '#F1F5F9' },
  coupon: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9333EA',
    backgroundColor: '#FAF5FF',
  },
  couponText: { fontSize: 12, fontWeight: '800', color: '#7E22CE', letterSpacing: 0.4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: authTheme.brand, marginTop: 6 },
});
