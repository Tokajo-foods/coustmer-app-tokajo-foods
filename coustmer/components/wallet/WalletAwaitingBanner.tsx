import { Hourglass } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { formatInr } from '@/lib/format/money';
import { walletPalette } from '@/lib/payment/wallet-display';

/** Shown while a paid top-up is still being credited by the server retry job. */
export function WalletAwaitingBanner({ amount, count }: { amount: number; count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.box}>
      <View style={styles.icon}>
        <Hourglass color={walletPalette.amber} size={16} strokeWidth={2.4} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{formatInr(amount)} payment received</Text>
        <Text style={styles.subtitle}>
          We are adding it to your wallet. This usually takes a minute — no need to pay again.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: walletPalette.amberSoft,
    borderWidth: 1,
    borderColor: walletPalette.amberBorder,
    borderRadius: 16,
    padding: 14,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: { color: walletPalette.amber, fontSize: 14, fontWeight: '800' },
  subtitle: { color: '#92400E', fontSize: 12, fontWeight: '500', lineHeight: 17 },
});
