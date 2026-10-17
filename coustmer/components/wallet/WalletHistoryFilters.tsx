import { ScrollView, StyleSheet, Text } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
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
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: walletPalette.ink, borderColor: walletPalette.ink },
  text: { color: '#3D4152', fontSize: 13, fontWeight: '600' },
  textActive: { color: '#FFFFFF', fontWeight: '700' },
});
