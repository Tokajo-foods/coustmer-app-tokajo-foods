import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';
import { WalletStatsRow } from './WalletStatsRow';

type Props = { overview: WalletOverview; onAddMoney?: () => void };

/** Balance, add-money action, lifetime totals. */
export function WalletBalancePanel({ overview, onAddMoney }: Props) {
  const locked = overview.isLocked;
  const canTopUp = Boolean(onAddMoney) && overview.topUp.enabled && !locked;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text style={styles.label}>Available balance</Text>
          <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
            {formatInr(overview.balance)}
          </Text>
        </View>
        {canTopUp ? (
          <SmoothPressable onPress={onAddMoney} style={styles.addBtn} accessibilityLabel="Add money to wallet">
            <Text style={styles.addText}>Add money</Text>
          </SmoothPressable>
        ) : null}
      </View>

      <Text style={[styles.note, locked && styles.noteLocked]}>
        {locked
          ? `Wallet locked${overview.lockReason ? ` · ${humanize(overview.lockReason)}` : ''}. Contact support to unlock it.`
          : canTopUp
            ? 'Pay for orders in one tap. Balance never expires.'
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
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    padding: 18,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, minWidth: 0 },
  label: { color: walletPalette.muted, fontSize: 13, fontWeight: '500' },
  balance: { marginTop: 4, color: walletPalette.ink, fontSize: 32, fontWeight: '700', letterSpacing: -0.6 },
  addBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  note: { marginTop: 10, color: walletPalette.muted, fontSize: 13, fontWeight: '400', lineHeight: 18 },
  noteLocked: { color: walletPalette.danger },
  divider: { height: 1, backgroundColor: walletPalette.hairline, marginTop: 16, marginBottom: 14 },
});
