import { StyleSheet, Switch, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

type Props = {
  label: string;
  detail?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
};

export function NotificationPrefRow({
  label,
  detail,
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
      <View style={styles.copy}>
        <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={1}>
          {label}
        </Text>
        {detail ? (
          <Text style={styles.detail} numberOfLines={2}>
            {detail}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#D1D5DB', true: authTheme.brand }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  rowDisabled: {
    opacity: 0.55,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  labelDisabled: {
    color: '#6B7280',
  },
  detail: {
    marginTop: 4,
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
});
