import { StyleSheet, Text, View } from 'react-native';

import { formatInr } from '@/lib/format/money';
import { CATEGORY_VISUALS, walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview, WalletTxCategory } from '@/lib/payment/wallet-types';

type Stat = { key: WalletTxCategory; label: string; value: number };

/** Lifetime totals straight from the ledger aggregate. */
export function WalletStatsRow({ overview }: { overview: WalletOverview }) {
  const stats: Stat[] = [
    { key: 'added', label: 'Added', value: overview.totalAdded },
    { key: 'spent', label: 'Spent', value: overview.totalSpent },
    { key: 'received', label: 'Received', value: overview.totalReceived + overview.totalRefunded },
  ];
  return (
    <View style={styles.row}>
      {stats.map((stat) => {
        const visual = CATEGORY_VISUALS[stat.key];
        const Icon = visual.icon;
        return (
          <View key={stat.key} style={styles.tile}>
            <View style={[styles.icon, { backgroundColor: visual.bg }]}>
              <Icon color={visual.color} size={15} strokeWidth={2.4} />
            </View>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {formatInr(stat.value)}
            </Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        );
      })}
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
    gap: 2,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  value: { color: walletPalette.ink, fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  label: { color: walletPalette.muted, fontSize: 11, fontWeight: '600' },
});
