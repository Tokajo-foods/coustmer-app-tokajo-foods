import {
  Bell,
  Bike,
  ChefHat,
  CircleCheck,
  CircleX,
  Clock,
  Gift,
  MapPin,
  Megaphone,
  Package,
  ReceiptText,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';

import type { AppNotification } from '@/lib/notification/types';

export type NotificationVisual = {
  Icon: LucideIcon;
  tint: string;
  bg: string;
  label: string;
};

const ORANGE = { tint: '#EA580C', bg: '#FFEDD5' };
const GREEN = { tint: '#16A34A', bg: '#DCFCE7' };
const RED = { tint: '#DC2626', bg: '#FEE2E2' };
const BLUE = { tint: '#2563EB', bg: '#DBEAFE' };
const PURPLE = { tint: '#9333EA', bg: '#F3E8FF' };
const SLATE = { tint: '#475569', bg: '#F1F5F9' };

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim().toLowerCase() : '';
}

/** Icon, colour and short label for an inbox row, based on what the notification is about. */
export function notificationVisual(n: AppNotification): NotificationVisual {
  const d = n.data ?? {};
  const kind = str(d.kind);
  const status = str(d.status);
  const category = str(d.category);
  const type = n.type.toLowerCase();

  if (category === 'announcement') return { Icon: Megaphone, ...BLUE, label: 'Announcement' };
  if (type === 'broadcast' || ['offer', 'offers', 'promo', 'marketing'].includes(category)) {
    return { Icon: Gift, ...PURPLE, label: 'Offer' };
  }
  if (type === 'payment' || kind.includes('refund') || kind.includes('wallet')) {
    return { Icon: Wallet, ...GREEN, label: 'Payment' };
  }

  const key = kind || status;
  if (/cancel|reject|timeout|no_partner|unavailable|returned|returning/.test(key)) {
    return { Icon: CircleX, ...RED, label: 'Order update' };
  }
  if (/delivered|collected/.test(key)) return { Icon: CircleCheck, ...GREEN, label: 'Delivered' };
  if (/nearby|arrived|unreachable/.test(key)) return { Icon: MapPin, ...ORANGE, label: 'Rider' };
  if (/rider|picked_up|out_for_delivery|reassigned|delayed/.test(key)) {
    return { Icon: Bike, ...ORANGE, label: 'Rider' };
  }
  if (/preparing|ready|kitchen/.test(key)) return { Icon: ChefHat, ...ORANGE, label: 'Kitchen' };
  if (/accepted|confirmed/.test(key)) return { Icon: ReceiptText, ...GREEN, label: 'Confirmed' };
  if (/placed|scheduled/.test(key)) return { Icon: Package, ...ORANGE, label: 'Order placed' };
  if (/delay|late/.test(key)) return { Icon: Clock, ...ORANGE, label: 'Order update' };
  if (type.includes('order') || type.includes('deliver')) return { Icon: Package, ...ORANGE, label: 'Order update' };
  return { Icon: Bell, ...SLATE, label: 'Update' };
}
