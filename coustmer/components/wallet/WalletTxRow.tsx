import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { formatInr } from '@/lib/format/money';
import { STATUS_LABELS, signedAmount, timeLabel, walletPalette } from '@/lib/payment/wallet-display';
import type { WalletHistoryItem } from '@/lib/payment/wallet-types';

type Props = { item: WalletHistoryItem; onPress: (item: WalletHistoryItem) => void };

function WalletTxRowBase({ item, onPress }: Props) {
  const isCredit = item.type === 'credit';
  const status = item.status !== 'completed' ? STATUS_LABELS[item.status] : null;
  const meta = [item.subtitle, timeLabel(item.createdAt)].filter(Boolean).join(' · ');

  return (
    <SmoothPressable
      onPress={() => onPress(item)}
      haptic={false}
      pressScale={0.99}
      style={styles.row}
      accessibilityLabel={`${item.title}, ${signedAmount(item, formatInr(item.amount))}`}
    >
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {meta ? <Text style={styles.meta} numberOfLines={1}>{meta}</Text> : null}
        {item.reason ? (
          <Text style={styles.reason} numberOfLines={2}>Reason: {item.reason}</Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, isCredit && styles.amountCredit]}>
          {signedAmount(item, formatInr(item.amount))}
        </Text>
        {status ? (
          <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
        ) : (
          <Text style={styles.balance} numberOfLines={1}>Bal. {formatInr(item.balanceAfter)}</Text>
        )}
      </View>
    </SmoothPressable>
  );
}

export const WalletTxRow = memo(WalletTxRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  body: { flex: 1, gap: 3 },
  title: { color: walletPalette.ink, fontSize: 14.5, fontWeight: '600' },
  meta: { color: walletPalette.muted, fontSize: 12.5, fontWeight: '400' },
  reason: { marginTop: 2, color: '#4B4E5A', fontSize: 12.5, fontWeight: '400', lineHeight: 17 },
  right: { alignItems: 'flex-end', gap: 3 },
  amount: { color: walletPalette.ink, fontSize: 15, fontWeight: '700' },
  amountCredit: { color: walletPalette.credit },
  balance: { color: '#9A9CA6', fontSize: 12, fontWeight: '400' },
  status: { fontSize: 12, fontWeight: '600' },
});
