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

/** Top of the wallet page: balance, quick add, lifetime totals. */
export function WalletBalancePanel({ overview, onAddMoney }: Props) {
  const canTopUp = overview.topUp.enabled && !overview.isLocked;
  const quick = overview.topUp.quickAmounts.slice(0, 4);

  return (
    <View style={styles.panel}>
      <Text style={styles.label}>Available balance</Text>
      <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
        {formatInr(overview.balance)}
      </Text>
      <Text style={styles.note}>
        {overview.isLocked
          ? `Wallet locked${overview.lockReason ? ` · ${humanize(overview.lockReason)}` : ''}. Contact support to unlock it.`
          : 'Use it on any order. Your balance never expires.'}
      </Text>

      {canTopUp ? (
        <>
          {quick.length ? (
            <View style={styles.quickRow}>
              {quick.map((value) => (
                <SmoothPressable
                  key={value}
                  onPress={() => onAddMoney(value)}
                  haptic="selection"
                  style={styles.quick}
                  accessibilityLabel={`Add ${formatInr(value)}`}
                >
                  <Text style={styles.quickText}>+ {formatInr(value)}</Text>
                </SmoothPressable>
              ))}
            </View>
          ) : null}
          <SmoothPressable onPress={() => onAddMoney()} style={styles.addBtn} accessibilityLabel="Add money to wallet">
            <Text style={styles.addText}>Add money</Text>
          </SmoothPressable>
        </>
      ) : !overview.isLocked ? (
        <Text style={styles.unavailable}>Adding money is unavailable right now. Please try again later.</Text>
      ) : null}

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
  panel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: walletPalette.hairline,
  },
  label: { color: walletPalette.muted, fontSize: 13, fontWeight: '500' },
  balance: { marginTop: 4, color: walletPalette.ink, fontSize: 34, fontWeight: '700', letterSpacing: -0.8 },
  note: { marginTop: 4, color: walletPalette.muted, fontSize: 12.5, fontWeight: '400', lineHeight: 18 },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  quick: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: { color: walletPalette.ink, fontSize: 13, fontWeight: '600' },
  addBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 12,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  unavailable: { marginTop: 14, color: walletPalette.amber, fontSize: 13, fontWeight: '500' },
  divider: { height: 1, backgroundColor: walletPalette.hairline, marginTop: 18, marginBottom: 14 },
});
