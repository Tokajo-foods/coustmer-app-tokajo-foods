import { BadgeCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { formatPhoneForDisplay } from '@/lib/auth/phone-number';

type Props = {
  phone: string;
  onChange?: () => void;
  disabled?: boolean;
};

export function VerifiedPhoneChip({ phone, onChange, disabled }: Props) {
  return (
    <View style={styles.chip}>
      <BadgeCheck color={authTheme.success} size={18} strokeWidth={2.2} />
      <View style={styles.body}>
        <Text style={styles.label}>Verified mobile</Text>
        <Text style={styles.phone}>{formatPhoneForDisplay(phone)}</Text>
      </View>
      {onChange ? (
        <Text
          style={[styles.change, disabled && styles.changeDisabled]}
          onPress={disabled ? undefined : onChange}
          accessibilityRole="button"
        >
          Change
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  body: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', color: authTheme.textDim },
  phone: { fontSize: 15, fontWeight: '800', color: authTheme.text, marginTop: 1 },
  change: { fontSize: 13, fontWeight: '800', color: authTheme.brand },
  changeDisabled: { opacity: 0.5 },
});
