import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';
import { WalletStatsRow } from './WalletStatsRow';

type Props = {
  overview: WalletOverview;
  onAddMoney: (amount?: number) => void;
};

/** Top of the wallet page: balance, add money, lifetime totals. */
export function WalletBalancePanel({ overview, onAddMoney }: Props) {
  const canTopUp = overview.topUp.enabled && !overview.isLocked;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.label}>Wallet balance</Text>
          <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
            {formatInr(overview.balance)}
          </Text>
        </View>
        {canTopUp ? (
          <SmoothPressable onPress={() => onAddMoney()} style={styles.addBtn} accessibilityLabel="Add money to wallet">
            <Text style={styles.addText}>+ Add money</Text>
          </SmoothPressable>
        ) : null}
      </View>

      <Text style={[styles.note, overview.isLocked && styles.noteLocked]}>
        {overview.isLocked
          ? `Wallet locked${overview.lockReason ? ` · ${humanize(overview.lockReason)}` : ''}. Contact support to unlock it.`
          : canTopUp
            ? 'Use it on any order. Your balance never expires.'
            : 'Adding money is unavailable right now. Please try again later.'}
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
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    padding: 18,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  label: { color: walletPalette.muted, fontSize: 13, fontWeight: '500' },
  balance: { marginTop: 2, color: walletPalette.ink, fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  addBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  note: { marginTop: 8, color: walletPalette.muted, fontSize: 12.5, fontWeight: '400' },
  noteLocked: { color: walletPalette.danger },
  divider: { height: 1, backgroundColor: walletPalette.hairline, marginTop: 16, marginBottom: 14 },
});
