import { Pressable } from '@/components/common/Pressable';
import { Mail, Phone, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

export type LoginModePref = 'email' | 'phone';

type Props = {
  value: LoginModePref;
  onChange: (mode: LoginModePref) => void;
};

const TABS: { mode: LoginModePref; label: string; Icon: LucideIcon }[] = [
  { mode: 'phone', label: 'Phone + password', Icon: Phone },
  { mode: 'email', label: 'Email + password', Icon: Mail },
];

export function LoginModeTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {TABS.map(({ mode, label, Icon }) => {
        const active = value === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            style={[styles.tab, active && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Icon size={16} color={active ? authTheme.brand : authTheme.textDim} strokeWidth={2.4} />
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: authTheme.tabBg,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 42,
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
