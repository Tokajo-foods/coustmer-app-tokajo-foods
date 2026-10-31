import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

type Props = {
  Icon: LucideIcon;
  iconTint?: string;
  iconBg?: string;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
};

export function NotificationPrefRow({
  Icon,
  iconTint = authTheme.brand,
  iconBg = authTheme.brandSoft,
  label,
  subtitle,
  value,
  onValueChange,
  disabled,
  isLast,
}: Props) {
  return (
    <View
      style={[
        styles.row,
        !isLast && styles.rowBorder,
        disabled && styles.rowDisabled,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon color={iconTint} size={20} strokeWidth={2.2} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E5E7EB', true: authTheme.brandMuted }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authTheme.cardBorder,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: authTheme.text,
    letterSpacing: -0.15,
  },
  subtitle: {
    marginTop: 3,
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 16,
    color: authTheme.textDim,
  },
});
