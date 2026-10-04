import { Pressable } from '@/components/common/Pressable';
import {
  Bell,
  Bike,
  Gift,
  Package,
  Shield,
  Wallet,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
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
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

function iconForType(type: string) {
  const t = type.toLowerCase();
  if (t.includes('order') || t.includes('food')) return Package;
  if (t.includes('deliver')) return Bike;
  if (t.includes('pay') || t.includes('wallet') || t.includes('refund'))
    return Wallet;
  if (t.includes('promo') || t.includes('offer') || t.includes('deal'))
    return Gift;
  if (t.includes('security') || t.includes('system')) return Shield;
  return Bell;
}

export function NotificationRow({ notification, onPress, onDelete }: Props) {
  const Icon = iconForType(notification.type);
  const unread = !notification.isRead;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      style={[styles.card, unread && styles.cardUnread]}
    >
      <View style={styles.iconWrap}>
        <Icon color={authTheme.brand} size={20} strokeWidth={2.1} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, unread && styles.titleUnread]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          {notification.createdAt ? (
            <Text style={styles.time}>
              {formatRelativeTime(notification.createdAt)}
            </Text>
          ) : null}
        </View>
        {notification.body ? (
          <Text style={styles.message} numberOfLines={2}>
            {notification.body}
          </Text>
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
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  cardUnread: {
    backgroundColor: '#FFF8F6',
    borderWidth: 1,
    borderColor: 'rgba(232, 116, 49, 0.2)',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.brandSoft,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: authTheme.text,
  },
  titleUnread: {
    fontWeight: '800',
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
    color: authTheme.textDim,
  },
  message: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: authTheme.textMuted,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: authTheme.brand,
    marginTop: 6,
  },
});
