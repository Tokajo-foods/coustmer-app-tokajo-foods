import { StyleSheet, Text, View } from 'react-native';

import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';

/** Lifetime totals straight from the ledger aggregate. */
export function WalletStatsRow({ overview }: { overview: WalletOverview }) {
  const stats = [
    { key: 'added', label: 'Total added', value: overview.totalAdded },
    { key: 'spent', label: 'Total spent', value: overview.totalSpent },
    { key: 'received', label: 'Credits & refunds', value: overview.totalReceived + overview.totalRefunded },
  ];
  return (
    <View style={styles.card}>
      {stats.map((stat, index) => (
        <View key={stat.key} style={[styles.cell, index > 0 && styles.divider]}>
          <Text style={styles.label} numberOfLines={1}>{stat.label}</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {formatInr(stat.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    paddingVertical: 14,
  },
  cell: { flex: 1, paddingHorizontal: 14, gap: 4 },
  divider: { borderLeftWidth: 1, borderLeftColor: walletPalette.hairline },
  label: { color: walletPalette.muted, fontSize: 12, fontWeight: '500' },
  value: { color: walletPalette.ink, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
