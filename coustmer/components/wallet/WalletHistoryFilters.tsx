import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { WALLET_FILTERS, walletPalette } from '@/lib/payment/wallet-display';
import type { WalletFilter } from '@/lib/payment/wallet-types';

type Props = { value: WalletFilter; onChange: (filter: WalletFilter) => void };

/** Segmented control: equal-width tabs on a grey track. */
export function WalletHistoryFilters({ value, onChange }: Props) {
  return (
    <View style={styles.track}>
      {WALLET_FILTERS.map((filter) => {
        const active = filter.id === value;
        return (
          <SmoothPressable
            key={filter.id}
            onPress={() => onChange(filter.id)}
            haptic="selection"
            pressScale={1}
            accessibilityRole="tab"
            accessibilityLabel={`${filter.label} transactions`}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.text, active && styles.textActive]} numberOfLines={1}>
              {filter.label}
            </Text>
          </SmoothPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: '#ECEDF1', borderRadius: 10, padding: 3 },
  segment: { flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  text: { color: walletPalette.muted, fontSize: 12.5, fontWeight: '500' },
  textActive: { color: walletPalette.ink, fontWeight: '700' },
});
