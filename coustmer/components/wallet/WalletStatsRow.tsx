import { StyleSheet, Text, View } from 'react-native';

import { formatInr } from '@/lib/format/money';
import { CATEGORY_VISUALS, walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview, WalletTxCategory } from '@/lib/payment/wallet-types';

type Stat = { key: WalletTxCategory; label: string; value: number };

/** Lifetime totals straight from the ledger aggregate. */
export function WalletStatsRow({ overview }: { overview: WalletOverview }) {
  const stats: Stat[] = [
    { key: 'added', label: 'Total added', value: overview.totalAdded },
    { key: 'spent', label: 'Total spent', value: overview.totalSpent },
    { key: 'received', label: 'Credits & refunds', value: overview.totalReceived + overview.totalRefunded },
  ];
  return (
    <View style={styles.card}>
      {stats.map((stat, index) => {
        const visual = CATEGORY_VISUALS[stat.key];
        const Icon = visual.icon;
        return (
          <View key={stat.key} style={[styles.cell, index > 0 && styles.divider]}>
            <View style={styles.labelRow}>
              <View style={[styles.icon, { backgroundColor: visual.bg }]}>
                <Icon color={visual.color} size={11} strokeWidth={2.6} />
              </View>
              <Text style={styles.label} numberOfLines={1}>{stat.label}</Text>
            </View>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {formatInr(stat.value)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    paddingVertical: 14,
  },
  cell: { flex: 1, paddingHorizontal: 12, gap: 6 },
  divider: { borderLeftWidth: 1, borderLeftColor: walletPalette.hairline },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  icon: { width: 18, height: 18, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  label: { flexShrink: 1, color: walletPalette.muted, fontSize: 11, fontWeight: '600' },
  value: { color: walletPalette.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
});
