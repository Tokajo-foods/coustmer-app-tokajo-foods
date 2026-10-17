import { useRouter } from 'expo-router';
import { ChevronRight, Copy, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable as RNPressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { copyTextToClipboard } from '@/lib/clipboard/copy-text';
import { formatInr } from '@/lib/format/money';
import {
  CATEGORY_VISUALS,
  STATUS_LABELS,
  fullDateTime,
  methodLabel,
  signedAmount,
  walletPalette,
} from '@/lib/payment/wallet-display';
import { useWalletTransaction } from '@/lib/payment/wallet-hooks';
import type { WalletHistoryItem } from '@/lib/payment/wallet-types';

type Props = { item: WalletHistoryItem | null; onClose: () => void };

/** Row data renders instantly; the detail query refreshes it from the server. */
export function WalletTxDetailSheet({ item, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const detail = useWalletTransaction(item?.id ?? null);
  const tx = detail.data ?? item;

  if (!tx) return null;
  const visual = CATEGORY_VISUALS[tx.category];
  const Icon = visual.icon;
  const status = STATUS_LABELS[tx.status] ?? STATUS_LABELS.completed!;
  const method = methodLabel(tx.paymentMethod);

  const copyId = async () => {
    if (!(await copyTextToClipboard(tx.transactionId))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openOrder = () => {
    if (!tx.orderId) return;
    onClose();
    router.push({ pathname: '/orders/[orderId]', params: { orderId: tx.orderId } });
  };

  return (
    <Modal visible={Boolean(item)} transparent animationType="slide" onRequestClose={onClose}>
      <RNPressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close details" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.handle} />
        <SmoothPressable onPress={onClose} style={styles.close} accessibilityLabel="Close">
          <X color={walletPalette.ink} size={18} />
        </SmoothPressable>

        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: visual.bg }]}>
            <Icon color={visual.color} size={26} strokeWidth={2.2} />
          </View>
          <Text style={[styles.amount, { color: tx.type === 'credit' ? walletPalette.credit : walletPalette.ink }]}>
            {signedAmount(tx, formatInr(tx.amount))}
          </Text>
          <Text style={styles.title}>{tx.title}</Text>
          <View style={[styles.status, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {tx.reason ? (
          <View style={[styles.reasonBox, { backgroundColor: visual.bg, borderLeftColor: visual.color }]}>
            <Text style={[styles.reasonLabel, { color: visual.color }]}>Reason</Text>
            <Text style={styles.reasonText}>{tx.reason}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <DetailRow
            label="Type"
            value={tx.type === 'credit' ? 'Money in · Credited' : 'Money out · Debited'}
          />
          <DetailRow label="Date & time" value={fullDateTime(tx.createdAt)} />
          {tx.subtitle ? <DetailRow label="Details" value={tx.subtitle} /> : null}
          {method ? <DetailRow label="Paid via" value={method} /> : null}
          <DetailRow label="Wallet balance after" value={formatInr(tx.balanceAfter)} />
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <SmoothPressable onPress={copyId} style={styles.copy} accessibilityLabel="Copy transaction ID">
              <Text style={styles.detailValue}>{copied ? 'Copied' : tx.transactionId}</Text>
              <Copy color={walletPalette.muted} size={13} />
            </SmoothPressable>
          </View>
        </View>

        {tx.orderId ? (
          <SmoothPressable onPress={openOrder} style={styles.orderBtn} accessibilityLabel="View order">
            <Text style={styles.orderText}>View order details</Text>
            <ChevronRight color={authTheme.brandDark} size={18} />
          </SmoothPressable>
        ) : null}
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,6,12,0.45)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E4E9' },
  close: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hero: { alignItems: 'center', gap: 6, paddingTop: 12 },
  heroIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  amount: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  title: { color: walletPalette.ink, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  status: { marginTop: 2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  reasonBox: { borderRadius: 12, borderLeftWidth: 3, paddingVertical: 12, paddingHorizontal: 14, gap: 4 },
  reasonLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  reasonText: { color: walletPalette.ink, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  card: {
    backgroundColor: '#FAFAFC',
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: walletPalette.hairline,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { color: walletPalette.muted, fontSize: 13, fontWeight: '500' },
  detailValue: { flexShrink: 1, textAlign: 'right', color: walletPalette.ink, fontSize: 13, fontWeight: '700' },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: authTheme.brandSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  orderText: { color: authTheme.brandDark, fontSize: 15, fontWeight: '800' },
});
