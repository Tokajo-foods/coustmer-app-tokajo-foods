import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { walletPalette } from '@/lib/payment/wallet-display';

export type WalletTab = 'wallet' | 'transactions';

const TABS: { id: WalletTab; label: string }[] = [
  { id: 'wallet', label: 'Wallet' },
  { id: 'transactions', label: 'Transactions' },
];

export function WalletTabs({ value, onChange }: { value: WalletTab; onChange: (tab: WalletTab) => void }) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active = tab.id === value;
        return (
          <SmoothPressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            haptic="selection"
            pressScale={1}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            style={styles.tab}
          >
            <Text style={[styles.text, active && styles.textActive]}>{tab.label}</Text>
            <View style={[styles.indicator, active && styles.indicatorActive]} />
          </SmoothPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: walletPalette.hairline,
  },
  tab: { flex: 1, alignItems: 'center', paddingTop: 12 },
  text: { color: walletPalette.muted, fontSize: 14.5, fontWeight: '600', paddingBottom: 10 },
  textActive: { color: authTheme.brandDark, fontWeight: '700' },
  indicator: { height: 3, width: '60%', borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: authTheme.brand },
});
