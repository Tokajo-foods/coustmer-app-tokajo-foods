import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { formatInr } from '@/lib/format/money';
import {
  CATEGORY_VISUALS,
  STATUS_LABELS,
  signedAmount,
  timeLabel,
  walletPalette,
} from '@/lib/payment/wallet-display';
import type { WalletHistoryItem } from '@/lib/payment/wallet-types';

type Props = { item: WalletHistoryItem; onPress: (item: WalletHistoryItem) => void };

function WalletTxRowBase({ item, onPress }: Props) {
  const visual = CATEGORY_VISUALS[item.category];
  const Icon = visual.icon;
  const isCredit = item.type === 'credit';
  const status = item.status !== 'completed' ? STATUS_LABELS[item.status] : null;
  const meta = [item.subtitle, timeLabel(item.createdAt)].filter(Boolean).join(' · ');

  return (
    <SmoothPressable
      onPress={() => onPress(item)}
      haptic={false}
      pressScale={0.985}
      style={styles.row}
      accessibilityLabel={`${item.title}, ${signedAmount(item, formatInr(item.amount))}`}
    >
      <View style={[styles.icon, { backgroundColor: visual.bg }]}>
        <Icon color={visual.color} size={18} strokeWidth={2.3} />
      </View>

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.amount, isCredit && styles.amountCredit]}>
            {signedAmount(item, formatInr(item.amount))}
          </Text>
        </View>
        <View style={styles.topLine}>
          <Text style={styles.meta} numberOfLines={1}>{meta}</Text>
          {status ? (
            <View style={[styles.status, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          ) : (
            <Text style={styles.balance} numberOfLines={1}>Bal {formatInr(item.balanceAfter)}</Text>
          )}
        </View>
        {item.reason ? (
          <Text style={styles.reason} numberOfLines={2}>
            <Text style={styles.reasonLabel}>Reason: </Text>
            {item.reason}
          </Text>
        ) : null}
      </View>
    </SmoothPressable>
  );
}

export const WalletTxRow = memo(WalletTxRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 4, paddingTop: 1 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, color: walletPalette.ink, fontSize: 14.5, fontWeight: '700', letterSpacing: -0.1 },
  amount: { color: walletPalette.ink, fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  amountCredit: { color: walletPalette.credit },
  meta: { flex: 1, color: walletPalette.muted, fontSize: 12, fontWeight: '500' },
  balance: { color: '#9A9CA6', fontSize: 11.5, fontWeight: '600' },
  status: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.2 },
  reason: { marginTop: 2, color: '#3D4152', fontSize: 12, fontWeight: '500', lineHeight: 17 },
  reasonLabel: { color: walletPalette.muted, fontWeight: '700' },
});
