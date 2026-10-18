import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { WALLET_FILTERS, walletPalette } from '@/lib/payment/wallet-display';
import type { WalletFilter } from '@/lib/payment/wallet-types';

type Props = { value: WalletFilter; onChange: (filter: WalletFilter) => void };

export function WalletHistoryFilters({ value, onChange }: Props) {
  return (
    <View style={styles.bar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
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
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.text, active && styles.textActive]}>{filter.label}</Text>
            </SmoothPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: 1, borderBottomColor: walletPalette.hairline },
  row: { gap: 22 },
  tab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: authTheme.brand },
  text: { color: walletPalette.muted, fontSize: 14, fontWeight: '500' },
  textActive: { color: walletPalette.ink, fontWeight: '700' },
});
