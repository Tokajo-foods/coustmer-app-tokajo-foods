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
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.label}>Your Tokajo balance</Text>
        <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
          {formatInr(overview.balance)}
        </Text>
        <Text style={[styles.note, overview.isLocked && styles.noteLocked]}>
          {overview.isLocked
            ? `Wallet locked${overview.lockReason ? ` · ${humanize(overview.lockReason)}` : ''}. Contact support to unlock it.`
            : 'Pay for food in one tap. It never expires.'}
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
                    <Text style={styles.quickText}>+{formatInr(value)}</Text>
                  </SmoothPressable>
                ))}
              </View>
            ) : null}
            <SmoothPressable onPress={() => onAddMoney()} style={styles.addBtn} accessibilityLabel="Add money to wallet">
              <Text style={styles.addText}>Add money</Text>
            </SmoothPressable>
          </>
        ) : !overview.isLocked ? (
          <Text style={styles.unavailable}>Adding money is paused right now. Please try again in a bit.</Text>
        ) : null}
      </View>

      <WalletStatsRow overview={overview} />
    </View>
  );
}

function humanize(code: string): string {
  const words = code.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  card: {
    backgroundColor: '#FFF3EA',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FDE2CC',
    padding: 20,
  },
  label: { color: '#9A4A16', fontSize: 13.5, fontWeight: '600' },
  balance: { marginTop: 4, color: walletPalette.ink, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  note: { marginTop: 2, color: '#7C5A44', fontSize: 13, fontWeight: '500' },
  noteLocked: { color: walletPalette.danger },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  quick: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FAD3B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: { color: authTheme.brandDark, fontSize: 13, fontWeight: '700' },
  addBtn: {
    marginTop: 12,
    height: 50,
    borderRadius: 16,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '800' },
  unavailable: { marginTop: 14, color: walletPalette.amber, fontSize: 13, fontWeight: '500' },
});
