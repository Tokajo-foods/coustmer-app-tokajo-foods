import { CreditCard, Landmark, Lock, Smartphone, type LucideIcon } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';
import type { WalletTopupMethod } from '@/lib/payment/wallet-topup-api';
import type { WalletOverview } from '@/lib/payment/wallet-types';

const METHODS: { id: WalletTopupMethod; title: string; hint: string; icon: LucideIcon }[] = [
  { id: 'upi', title: 'UPI', hint: 'Google Pay, PhonePe, Paytm & any UPI app', icon: Smartphone },
  { id: 'card', title: 'Credit / Debit card', hint: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'netbanking', title: 'Netbanking', hint: 'All major Indian banks', icon: Landmark },
];

type Props = {
  overview: WalletOverview;
  amount: string;
  onAmountChange: (value: string) => void;
  method: WalletTopupMethod;
  onMethodChange: (method: WalletTopupMethod) => void;
  validation: string | null;
  serverError: string | null;
};

export function WalletTopupForm({
  overview,
  amount,
  onAmountChange,
  method,
  onMethodChange,
  validation,
  serverError,
}: Props) {
  const { minAmount, maxAmount, quickAmounts } = overview.topUp;
  const message = serverError ?? (amount ? validation : null);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Current balance</Text>
        <Text style={styles.balanceValue}>{formatInr(overview.balance)}</Text>
      </View>

      <View style={styles.amountCard}>
        <Text style={styles.sectionLabel}>Enter amount</Text>
        <View style={styles.inputRow}>
          <Text style={[styles.rupee, !amount && styles.placeholder]}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={(text) => onAmountChange(text.replace(/[^0-9]/g, '').replace(/^0+/, '').slice(0, 6))}
            placeholder="0"
            placeholderTextColor="#C2C4CC"
            keyboardType="number-pad"
            style={styles.input}
            autoFocus
            accessibilityLabel="Amount to add"
          />
        </View>
        <View style={[styles.divider, message ? styles.dividerError : null]} />
        <Text style={[styles.limits, message ? styles.error : null]}>
          {message ?? `Add between ${formatInr(minAmount)} and ${formatInr(maxAmount)}`}
        </Text>

        {quickAmounts.length ? (
          <View style={styles.chips}>
            {quickAmounts.map((value) => {
              const active = amount === String(value);
              return (
                <SmoothPressable
                  key={value}
                  onPress={() => onAmountChange(String(value))}
                  haptic="selection"
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityLabel={`Add ${formatInr(value)}`}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>+ {formatInr(value)}</Text>
                </SmoothPressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Pay using</Text>
      <View style={styles.methods}>
        {METHODS.map((item, index) => {
          const active = item.id === method;
          const Icon = item.icon;
          return (
            <SmoothPressable
              key={item.id}
              onPress={() => onMethodChange(item.id)}
              haptic="selection"
              pressScale={0.99}
              style={[styles.method, index > 0 && styles.methodBorder]}
              accessibilityLabel={item.title}
            >
              <View style={[styles.methodIcon, active && styles.methodIconActive]}>
                <Icon color={active ? authTheme.brandDark : walletPalette.muted} size={18} strokeWidth={2.2} />
              </View>
              <View style={styles.methodBody}>
                <Text style={styles.methodTitle}>{item.title}</Text>
                <Text style={styles.methodHint} numberOfLines={1}>{item.hint}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
            </SmoothPressable>
          );
        })}
      </View>

      <View style={styles.secure}>
        <Lock color="#93959F" size={12} />
        <Text style={styles.secureText}>100% secure payments powered by Razorpay</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: authTheme.brandSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  balanceLabel: { color: '#7C2D12', fontSize: 13, fontWeight: '600' },
  balanceValue: { color: authTheme.brandDark, fontSize: 15, fontWeight: '800' },
  amountCard: { borderWidth: 1, borderColor: walletPalette.hairline, borderRadius: 20, padding: 18 },
  sectionLabel: { color: walletPalette.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  rupee: { color: walletPalette.ink, fontSize: 36, fontWeight: '800', marginRight: 4 },
  placeholder: { color: '#C2C4CC' },
  input: { flex: 1, color: walletPalette.ink, fontSize: 36, fontWeight: '800', paddingVertical: 4, letterSpacing: -0.5 },
  divider: { height: 2, backgroundColor: authTheme.brand, borderRadius: 1, marginTop: 4 },
  dividerError: { backgroundColor: walletPalette.danger },
  limits: { marginTop: 8, color: walletPalette.muted, fontSize: 12, fontWeight: '600' },
  error: { color: walletPalette.danger },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    backgroundColor: '#FAFAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { borderColor: authTheme.brand, backgroundColor: authTheme.brandSoft },
  chipText: { color: '#3D4152', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: authTheme.brandDark },
  sectionTitle: { color: walletPalette.ink, fontSize: 15, fontWeight: '800', marginTop: 4 },
  methods: { borderWidth: 1, borderColor: walletPalette.hairline, borderRadius: 20, overflow: 'hidden' },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: '#FFFFFF' },
  methodBorder: { borderTopWidth: 1, borderTopColor: walletPalette.hairline },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconActive: { backgroundColor: authTheme.brandMuted },
  methodBody: { flex: 1, gap: 2 },
  methodTitle: { color: walletPalette.ink, fontSize: 14, fontWeight: '700' },
  methodHint: { color: walletPalette.muted, fontSize: 12, fontWeight: '500' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D0D2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: authTheme.brand },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: authTheme.brand },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secureText: { color: '#93959F', fontSize: 12, fontWeight: '600' },
});
