import { ScrollView, StyleSheet, Text } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { WALLET_FILTERS, walletPalette } from '@/lib/payment/wallet-display';
import type { WalletFilter } from '@/lib/payment/wallet-types';

type Props = { value: WalletFilter; onChange: (filter: WalletFilter) => void };

export function WalletHistoryFilters({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {WALLET_FILTERS.map((filter) => {
        const active = filter.id === value;
        return (
          <SmoothPressable
            key={filter.id}
            onPress={() => onChange(filter.id)}
            haptic="selection"
            accessibilityRole="tab"
            accessibilityLabel={`${filter.label} transactions`}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{filter.label}</Text>
          </SmoothPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  chip: {
    height: 34,
    paddingHorizontal: 15,
    borderRadius: 999,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: authTheme.brandSoft },
  text: { color: '#4B4E5A', fontSize: 13, fontWeight: '600' },
  textActive: { color: authTheme.brandDark, fontWeight: '700' },
});
