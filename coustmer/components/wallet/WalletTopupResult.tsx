import { CircleCheck, Hourglass } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';

export type TopupOutcome = { kind: 'credited' | 'processing'; amount: number };

type Props = { outcome: TopupOutcome; balance: number | null; onDone: () => void };

export function WalletTopupResult({ outcome, balance, onDone }: Props) {
  const credited = outcome.kind === 'credited';
  return (
    <View style={styles.wrap}>
      <View style={styles.center}>
        <View style={[styles.ring, credited ? styles.ringSuccess : styles.ringPending]}>
          <View style={[styles.icon, credited ? styles.iconSuccess : styles.iconPending]}>
            {credited ? (
              <CircleCheck color="#FFFFFF" size={40} strokeWidth={2.4} />
            ) : (
              <Hourglass color="#FFFFFF" size={34} strokeWidth={2.4} />
            )}
          </View>
        </View>
        <Text style={styles.amount}>{formatInr(outcome.amount)}</Text>
        <Text style={styles.title}>{credited ? 'Added to your wallet' : 'Payment received'}</Text>
        <Text style={styles.subtitle}>
          {credited
            ? 'Your money is safe in your wallet and never expires. Use it on your next order.'
            : 'We are confirming it with your bank. Your wallet will be credited automatically — no need to pay again.'}
        </Text>
        {credited && balance != null ? (
          <View style={styles.balancePill}>
            <Text style={styles.balanceLabel}>New balance</Text>
            <Text style={styles.balanceValue}>{formatInr(balance)}</Text>
          </View>
        ) : null}
      </View>
      <SmoothPressable onPress={onDone} style={styles.cta} accessibilityLabel="Done">
        <Text style={styles.ctaText}>Done</Text>
      </SmoothPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  ring: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  ringSuccess: { backgroundColor: walletPalette.creditSoft },
  ringPending: { backgroundColor: walletPalette.amberSoft },
  icon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  iconSuccess: { backgroundColor: walletPalette.credit },
  iconPending: { backgroundColor: '#F59E0B' },
  amount: { color: walletPalette.ink, fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  title: { color: walletPalette.ink, fontSize: 18, fontWeight: '800' },
  subtitle: {
    color: walletPalette.muted,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  balancePill: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F7F7FA',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  balanceLabel: { color: walletPalette.muted, fontSize: 13, fontWeight: '600' },
  balanceValue: { color: walletPalette.ink, fontSize: 13, fontWeight: '800' },
  cta: {
    height: 52,
    borderRadius: 14,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
