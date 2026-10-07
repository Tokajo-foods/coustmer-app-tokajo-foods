import { Pressable } from '@/components/common/Pressable';
import { Mail, Phone } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

export type LoginModePref = 'email' | 'phone';

type Props = {
  value: LoginModePref;
  onChange: (mode: LoginModePref) => void;
};

export function LoginModeTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange('email')}
        style={[styles.tab, value === 'email' && styles.tabActive]}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'email' }}
      >
        <Mail
          size={16}
          color={value === 'email' ? authTheme.brand : authTheme.textDim}
          strokeWidth={2.4}
        />
        <Text style={[styles.label, value === 'email' && styles.labelActive]}>Email</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('phone')}
        style={[styles.tab, value === 'phone' && styles.tabActive]}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'phone' }}
      >
        <Phone
          size={16}
          color={value === 'phone' ? authTheme.brand : authTheme.textDim}
          strokeWidth={2.4}
        />
        <Text style={[styles.label, value === 'phone' && styles.labelActive]}>Phone OTP</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: authTheme.tabBg,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: authTheme.tabActive,
    shadowColor: authTheme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: authTheme.textDim,
  },
  labelActive: {
    color: authTheme.brand,
    fontWeight: '800',
  },
});
