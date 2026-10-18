import { StyleSheet, Text, View } from 'react-native';

import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';

/** Lifetime totals straight from the ledger aggregate. */
export function WalletStatsRow({ overview }: { overview: WalletOverview }) {
  const stats = [
    { key: 'added', label: 'Added', value: overview.totalAdded, color: walletPalette.ink },
    { key: 'spent', label: 'Spent', value: overview.totalSpent, color: walletPalette.ink },
    {
      key: 'received',
      label: 'Credits & refunds',
      value: overview.totalReceived + overview.totalRefunded,
      color: walletPalette.credit,
    },
  ];
  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.key} style={styles.tile}>
          <Text style={styles.label} numberOfLines={1}>{stat.label}</Text>
          <Text style={[styles.value, { color: stat.color }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatInr(stat.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  label: { color: walletPalette.muted, fontSize: 12, fontWeight: '500' },
  value: { fontSize: 16, fontWeight: '700' },
});
