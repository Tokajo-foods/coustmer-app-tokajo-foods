import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';

/** Lifetime totals straight from the ledger aggregate. */
export function WalletStatsRow({ overview }: { overview: WalletOverview }) {
  const stats = [
    { key: 'added', label: 'Total added', value: overview.totalAdded, dot: walletPalette.credit },
    { key: 'spent', label: 'Total spent', value: overview.totalSpent, dot: authTheme.brand },
    { key: 'received', label: 'Received', value: overview.totalReceived + overview.totalRefunded, dot: '#2563EB' },
  ];
  return (
    <View style={styles.row}>
      {stats.map((stat, index) => (
        <View key={stat.key} style={[styles.cell, index === 0 ? styles.first : styles.divider]}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: stat.dot }]} />
            <Text style={styles.label} numberOfLines={1}>{stat.label}</Text>
          </View>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {formatInr(stat.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1, gap: 4, paddingHorizontal: 12 },
  first: { paddingLeft: 0 },
  divider: { borderLeftWidth: 1, borderLeftColor: walletPalette.hairline },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { flexShrink: 1, color: walletPalette.muted, fontSize: 12, fontWeight: '500' },
  value: { color: walletPalette.ink, fontSize: 16, fontWeight: '700' },
});
