import { Check, X } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

const RULES: Array<{ label: string; test: (v: string) => boolean }> = [
  { label: '8–128 characters', test: (v) => v.length >= 8 && v.length <= 128 },
  { label: 'Uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Number', test: (v) => /\d/.test(v) },
  { label: 'Special character', test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
];

const LEVELS = [
  { label: 'Too weak', color: authTheme.error },
  { label: 'Weak', color: authTheme.error },
  { label: 'Fair', color: '#F59E0B' },
  { label: 'Good', color: '#F59E0B' },
  { label: 'Strong', color: authTheme.success },
];

/** Mirrors the backend rule: 8–128 chars with upper, lower, digit and special. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const passed = RULES.map((r) => r.test(password));
  const score = passed.filter(Boolean).length;
  const level = LEVELS[Math.max(0, score - 1)];

  return (
    <View style={styles.wrap}>
      <View style={styles.barRow}>
        {RULES.map((_, i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i < score ? level.color : authTheme.inputBorder }]}
          />
        ))}
        <Text style={[styles.levelText, { color: level.color }]}>{level.label}</Text>
      </View>
      <View style={styles.rules}>
        {RULES.map((rule, i) => (
          <View key={rule.label} style={styles.rule}>
            {passed[i] ? (
              <Check size={12} color={authTheme.success} strokeWidth={3} />
            ) : (
              <X size={12} color={authTheme.textDim} strokeWidth={3} />
            )}
            <Text style={[styles.ruleText, passed[i] && styles.ruleTextOk]}>{rule.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: -6, marginBottom: 14, paddingHorizontal: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  levelText: { fontSize: 11, fontWeight: '700', marginLeft: 6, minWidth: 54, textAlign: 'right' },
  rules: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ruleText: { fontSize: 11, color: authTheme.textDim, fontWeight: '500' },
  ruleTextOk: { color: authTheme.success },
});
