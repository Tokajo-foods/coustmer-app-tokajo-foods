import {
  ArrowDownLeft,
  CircleMinus,
  Gift,
  RotateCcw,
  ShoppingBag,
  Undo2,
  type LucideIcon,
} from 'lucide-react-native';

import type { WalletFilter, WalletHistoryItem, WalletTxCategory } from '@/lib/payment/wallet-types';

export const walletPalette = {
  credit: '#16A34A',
  creditSoft: '#ECFDF3',
  debit: '#0B1220',
  amber: '#B45309',
  amberSoft: '#FFFBEB',
  amberBorder: '#FDE68A',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  ink: '#02060C',
  muted: '#686B78',
  hairline: '#EEEEF2',
} as const;

type CategoryVisual = { icon: LucideIcon; color: string; bg: string; label: string };

export const CATEGORY_VISUALS: Record<WalletTxCategory, CategoryVisual> = {
  added: { icon: ArrowDownLeft, color: '#16A34A', bg: '#ECFDF3', label: 'Added' },
  spent: { icon: ShoppingBag, color: '#EA580C', bg: '#FFF4EC', label: 'Spent' },
  refund: { icon: RotateCcw, color: '#2563EB', bg: '#EFF6FF', label: 'Refund' },
  received: { icon: Gift, color: '#9333EA', bg: '#F5F0FF', label: 'Received' },
  reversal: { icon: Undo2, color: '#475569', bg: '#F1F5F9', label: 'Reversal' },
  adjustment: { icon: CircleMinus, color: '#DC2626', bg: '#FEF2F2', label: 'Deducted' },
};

export const WALLET_FILTERS: { id: WalletFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'added', label: 'Added' },
  { id: 'spent', label: 'Spent' },
  { id: 'received', label: 'Received' },
  { id: 'refund', label: 'Refunds' },
];

export const EMPTY_COPY: Record<WalletFilter, { title: string; subtitle: string }> = {
  all: { title: 'No transactions yet', subtitle: 'Add money to your wallet and pay for orders in one tap.' },
  added: { title: 'No money added yet', subtitle: 'Money you add via UPI, card or netbanking shows up here.' },
  spent: { title: 'Nothing spent yet', subtitle: 'Orders paid from your wallet and any deductions by Tokajo appear here.' },
  received: { title: 'No credits yet', subtitle: 'Money added by Tokajo, cashback and rewards appear here.' },
  refund: { title: 'No refunds', subtitle: 'Refunds credited to your wallet will appear here.' },
};

const METHOD_LABELS: Record<string, string> = {
  upi: 'UPI',
  card: 'Credit / Debit card',
  netbanking: 'Netbanking',
  wallet: 'Wallet',
  emi: 'EMI',
};

export function methodLabel(method: string | null): string | null {
  return method ? METHOD_LABELS[method] ?? method.toUpperCase() : null;
}

export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Successful', color: '#16A34A', bg: '#ECFDF3' },
  pending: { label: 'Pending', color: '#B45309', bg: '#FFFBEB' },
  processing: { label: 'Processing', color: '#B45309', bg: '#FFFBEB' },
  failed: { label: 'Failed', color: '#DC2626', bg: '#FEF2F2' },
  reversed: { label: 'Reversed', color: '#475569', bg: '#F1F5F9' },
};

export function signedAmount(tx: Pick<WalletHistoryItem, 'type'>, formatted: string): string {
  return tx.type === 'credit' ? `+ ${formatted}` : `− ${formatted}`;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function dayLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Earlier';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return 'Today';
  if (dayKey(date) === dayKey(yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

export function timeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function fullDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${timeLabel(iso)}`;
}

export type WalletSection = { title: string; data: WalletHistoryItem[] };

/** Groups newest-first rows into Today / Yesterday / date sections. */
export function groupByDay(items: WalletHistoryItem[]): WalletSection[] {
  const sections: WalletSection[] = [];
  for (const item of items) {
    const title = dayLabel(item.createdAt);
    const last = sections[sections.length - 1];
    if (last && last.title === title) last.data.push(item);
    else sections.push({ title, data: [item] });
  }
  return sections;
}
