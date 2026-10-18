import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletOverview } from '@/lib/payment/wallet-types';

type Props = { overview: WalletOverview; onProceed: (amount: number) => void };

/** Inline add-money entry; payment method + Razorpay continue in the top-up sheet. */
export function WalletAddMoneyCard({ overview, onProceed }: Props) {
  const [amount, setAmount] = useState('');
  const { minAmount, maxAmount, quickAmounts } = overview.topUp;
  const value = Number(amount) || 0;
  const error = !value
    ? null
    : value < minAmount
      ? `Minimum amount is ${formatInr(minAmount)}`
      : value > maxAmount
        ? `Maximum amount is ${formatInr(maxAmount)}`
        : null;
  const ready = value > 0 && !error;

  const proceed = () => {
    if (!ready) return;
    onProceed(value);
    setAmount('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Add money to wallet</Text>

      <View style={[styles.inputBox, error ? styles.inputBoxError : null]}>
        <Text style={[styles.rupee, !amount && styles.placeholder]}>₹</Text>
        <TextInput
          value={amount}
          onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, '').replace(/^0+/, '').slice(0, 6))}
          placeholder="Enter amount"
          placeholderTextColor="#A9ABB4"
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={proceed}
          style={styles.input}
          accessibilityLabel="Amount to add"
        />
      </View>
      <Text style={[styles.hint, error ? styles.hintError : null]}>
        {error ?? `Add between ${formatInr(minAmount)} and ${formatInr(maxAmount)}`}
      </Text>

      {quickAmounts.length ? (
        <View style={styles.chips}>
          {quickAmounts.slice(0, 4).map((q) => {
            const active = amount === String(q);
            return (
              <SmoothPressable
                key={q}
                onPress={() => setAmount(String(q))}
                haptic="selection"
                style={[styles.chip, active && styles.chipActive]}
                accessibilityLabel={`Select ${formatInr(q)}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{formatInr(q)}</Text>
              </SmoothPressable>
            );
          })}
        </View>
      ) : null}

      <SmoothPressable
        onPress={proceed}
        disabled={!ready}
        style={[styles.cta, !ready && styles.ctaDisabled]}
        accessibilityLabel="Proceed to add money"
      >
        <Text style={styles.ctaText}>{ready ? `Proceed to add ${formatInr(value)}` : 'Proceed'}</Text>
      </SmoothPressable>
      <Text style={styles.secure}>Pay securely with UPI, cards or netbanking</Text>
    </View>
  );
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
  title: { color: walletPalette.ink, fontSize: 15.5, fontWeight: '700' },
  inputBox: {
    marginTop: 14,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCDDE3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputBoxError: { borderColor: walletPalette.danger },
  rupee: { color: walletPalette.ink, fontSize: 20, fontWeight: '600', marginRight: 6 },
  placeholder: { color: '#A9ABB4' },
  input: { flex: 1, color: walletPalette.ink, fontSize: 18, fontWeight: '600', paddingVertical: 0 },
  hint: { marginTop: 6, color: walletPalette.muted, fontSize: 12, fontWeight: '400' },
  hintError: { color: walletPalette.danger },
  chips: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCDDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { borderColor: authTheme.brand, backgroundColor: authTheme.brandSoft },
  chipText: { color: walletPalette.ink, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: authTheme.brandDark },
  cta: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: '#F9B98A' },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secure: { marginTop: 10, textAlign: 'center', color: '#9A9CA6', fontSize: 11.5, fontWeight: '400' },
});
