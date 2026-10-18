import { StyleSheet, Text, View } from 'react-native';

import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';
import { WalletStatsRow } from './WalletStatsRow';

/** Balance + lifetime totals. */
export function WalletBalancePanel({ overview }: { overview: WalletOverview }) {
  const locked = overview.isLocked;
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Available balance</Text>
      <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
        {formatInr(overview.balance)}
      </Text>
      <Text style={[styles.note, locked && styles.noteLocked]}>
        {locked
          ? `Wallet locked${overview.lockReason ? ` · ${humanize(overview.lockReason)}` : ''}. Contact support to unlock it.`
          : 'Use it on any order. Your balance never expires.'}
      </Text>
      <View style={styles.divider} />
      <WalletStatsRow overview={overview} />
    </View>
  );
}

function humanize(code: string): string {
  const words = code.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    padding: 18,
  },
  label: { color: walletPalette.muted, fontSize: 13, fontWeight: '500' },
  balance: { marginTop: 4, color: walletPalette.ink, fontSize: 32, fontWeight: '700', letterSpacing: -0.6 },
  note: { marginTop: 4, color: walletPalette.muted, fontSize: 13, fontWeight: '400', lineHeight: 18 },
  noteLocked: { color: walletPalette.danger },
  divider: { height: 1, backgroundColor: walletPalette.hairline, marginTop: 16, marginBottom: 14 },
});
