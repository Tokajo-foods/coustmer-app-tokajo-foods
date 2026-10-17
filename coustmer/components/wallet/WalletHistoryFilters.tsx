import { ScrollView, StyleSheet, Text } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { WALLET_FILTERS, walletPalette } from '@/lib/payment/wallet-display';
import type { WalletFilter } from '@/lib/payment/wallet-types';

type Props = { value: WalletFilter; onChange: (filter: WalletFilter) => void };

export function WalletHistoryFilters({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
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
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: walletPalette.hairline,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: authTheme.brandSoft, borderColor: authTheme.brand },
  text: { color: walletPalette.muted, fontSize: 13, fontWeight: '700' },
  textActive: { color: authTheme.brandDark },
});
