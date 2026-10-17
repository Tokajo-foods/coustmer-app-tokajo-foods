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
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[item.subtitle, timeLabel(item.createdAt)].filter(Boolean).join(' · ')}
        </Text>
        {item.reason ? (
          <View style={styles.reason}>
            <Text style={styles.reasonText} numberOfLines={2}>
              {item.reason}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isCredit ? walletPalette.credit : walletPalette.debit }]}>
          {signedAmount(item, formatInr(item.amount))}
        </Text>
        {status ? (
          <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
        ) : (
          <Text style={styles.balance} numberOfLines={1}>
            Bal {formatInr(item.balanceAfter)}
          </Text>
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
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3, paddingTop: 1 },
  title: { color: walletPalette.ink, fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
  meta: { color: walletPalette.muted, fontSize: 12, fontWeight: '500' },
  reason: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#F7F7FA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  reasonText: { color: '#3D4152', fontSize: 11.5, fontWeight: '600', lineHeight: 15 },
  right: { alignItems: 'flex-end', gap: 3, paddingTop: 1, maxWidth: 120 },
  amount: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  balance: { color: '#93959F', fontSize: 11, fontWeight: '600' },
  status: { fontSize: 11, fontWeight: '800' },
});
