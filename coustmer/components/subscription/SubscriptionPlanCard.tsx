import { Check } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { planBenefitLabels, planPeriodLabel } from '@/lib/customer/subscription-display';
import type { SubscriptionPlan } from '@/lib/customer/types';
import { formatInr } from '@/lib/format/money';

type Props = {
  plan: SubscriptionPlan;
  isActive: boolean;
  /** Another plan is active — buying now would overlap the paid period. */
  locked: boolean;
  busy: boolean;
  disabled: boolean;
  onSubscribe: (plan: SubscriptionPlan) => void;
};

export function SubscriptionPlanCard({ plan, isActive, locked, busy, disabled, onSubscribe }: Props) {
  const benefits = planBenefitLabels(plan);
  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <Text style={styles.name}>{plan.name}</Text>
      <Text style={styles.price}>
        {formatInr(plan.price)}
        <Text style={styles.period}> / {planPeriodLabel(plan.period)}</Text>
      </Text>

      {benefits.length > 0 && (
        <View style={styles.benefits}>
          {benefits.map((label) => (
            <View key={label} style={styles.benefitRow}>
              <Check size={14} color="#16A34A" strokeWidth={2.5} />
              <Text style={styles.benefitText}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {isActive ? (
        <View style={styles.activeLabel}>
          <Text style={styles.activeLabelText}>Your current plan</Text>
        </View>
      ) : locked ? (
        <Text style={styles.lockedText}>Available after your current membership ends</Text>
      ) : (
        <TouchableOpacity
          style={[styles.btn, (disabled || busy) && styles.btnDisabled]}
          activeOpacity={0.85}
          disabled={disabled || busy}
          onPress={() => onSubscribe(plan)}
          accessibilityRole="button"
          accessibilityLabel={`Subscribe to ${plan.name} for ${formatInr(plan.price)}`}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Subscribe · {formatInr(plan.price)}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  cardActive: { borderColor: '#7C3AED', borderWidth: 2 },
  name: { fontFamily: fonts.displayBold, fontSize: 18, color: '#0B1220', marginBottom: 4 },
  price: { fontFamily: fonts.displayBold, fontSize: 24, color: '#111827', marginBottom: 12 },
  period: { fontFamily: fonts.ui, fontSize: 14, color: '#6B7280' },
  benefits: { gap: 6, marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitText: { fontFamily: fonts.ui, fontSize: 13, color: '#374151', lineHeight: 18, flex: 1 },
  activeLabel: {
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabelText: { fontFamily: fonts.uiBold, fontSize: 14, color: '#16A34A' },
  lockedText: { fontFamily: fonts.ui, fontSize: 12, color: '#6B7280', textAlign: 'center' },
  btn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: fonts.uiBold, fontSize: 15, color: '#FFFFFF' },
});
