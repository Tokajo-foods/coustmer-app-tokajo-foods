import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';
import { WalletStatsRow } from './WalletStatsRow';

/** Balance + lifetime totals. */
export function WalletBalancePanel({ overview }: { overview: WalletOverview }) {
  const locked = overview.isLocked;
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <View style={styles.dot} />
          <Text style={styles.brandText}>Tokajo Wallet</Text>
        </View>
        <View style={[styles.tag, locked && styles.tagLocked]}>
          <Text style={[styles.tagText, locked && styles.tagTextLocked]}>{locked ? 'Locked' : 'Never expires'}</Text>
        </View>
      </View>

      <Text style={styles.label}>Available balance</Text>
      <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
        {formatInr(overview.balance)}
      </Text>
      <Text style={[styles.note, locked && styles.noteLocked]}>
        {locked
          ? `${overview.lockReason ? `${humanize(overview.lockReason)}. ` : ''}Contact support to unlock your wallet.`
          : 'Use it on any order for one-tap checkout.'}
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    padding: 18,
    shadowColor: '#1F2430',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 3, backgroundColor: authTheme.brand },
  brandText: { color: walletPalette.ink, fontSize: 13.5, fontWeight: '700', letterSpacing: 0.1 },
  tag: { backgroundColor: walletPalette.creditSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagLocked: { backgroundColor: walletPalette.dangerSoft },
  tagText: { color: walletPalette.credit, fontSize: 11.5, fontWeight: '700' },
  tagTextLocked: { color: walletPalette.danger },
  label: { marginTop: 18, color: walletPalette.muted, fontSize: 13, fontWeight: '500' },
  balance: { marginTop: 2, color: walletPalette.ink, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  note: { marginTop: 2, color: walletPalette.muted, fontSize: 12.5, fontWeight: '400' },
  noteLocked: { color: walletPalette.danger },
  divider: { height: 1, backgroundColor: walletPalette.hairline, marginTop: 16, marginBottom: 14 },
});
