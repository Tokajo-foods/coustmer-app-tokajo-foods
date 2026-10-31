import { Pressable } from '@/components/common/Pressable';
import { Check, CreditCard, Store, Truck, Wallet, X } from 'lucide-react-native';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/constants/typography';
import { canonicalPayChoice, type PayChoice } from '@/lib/checkout/payment-display';
import { formatInr } from '@/lib/format/money';
import type { WalletSummary } from '@/lib/payment/types';

const ORANGE = '#F97316';
const TEXT = '#0B1220';
const TEXT_SEC = '#64748B';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedMethod: string;
  onSelectMethod: (method: PayChoice) => void;
  itemCount: number;
  total: number;
  savings: number;
  restaurantName: string;
  deliveryTime?: string;
  addressLabel: string;
  addressText: string;
  wallet?: WalletSummary;
  walletShortfall?: number | null;
  /** False while the delivery fee (and therefore the bill) is still being calculated. */
  amountReady?: boolean;
  /** Scheduled orders are prepaid: cash on delivery is not offered. */
  allowCod?: boolean;
  /** Takeaway cash is collected at the restaurant, not at the door. */
  isTakeaway?: boolean;
};

const OPTIONS: Array<{
  id: PayChoice;
  title: string;
  hint: string;
  Icon: typeof Truck;
}> = [
  {
    id: 'cod',
    title: 'Cash on delivery',
    hint: 'Pay cash when the order arrives',
    Icon: Truck,
  },
  {
    id: 'online',
    title: 'Pay online',
    hint: 'GPay, PhonePe, Paytm, cards and netbanking',
    Icon: CreditCard,
  },
  {
    id: 'wallet',
    title: 'Wallet',
    hint: 'Pay the full bill from your Tokajo balance',
    Icon: Wallet,
  },
];

export function PaymentOptionsModal({
  visible,
  onClose,
  selectedMethod,
  onSelectMethod,
  total,
  savings,
  wallet,
  walletShortfall,
  amountReady = true,
  allowCod = true,
  isTakeaway = false,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const selected = canonicalPayChoice(selectedMethod);

  const choose = (id: PayChoice) => {
    if (!amountReady) {
      Alert.alert('Calculating your bill', 'The delivery fee is still being calculated. Try again in a moment.');
      return;
    }
    if (id === 'wallet' && walletShortfall != null && walletShortfall > 0) {
      Alert.alert(
        'Wallet balance is short',
        `This bill is ${formatInr(total)}. Add ${formatInr(walletShortfall)} to your wallet, or pay online.`,
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Top up',
            onPress: () => {
              onClose();
              router.push('/profile/wallet' as import('expo-router').Href);
            },
          },
        ]
      );
      return;
    }
    onSelectMethod(id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Pay using</Text>
              <Text style={styles.subtitle}>
                {amountReady ? formatInr(total) : 'Calculating…'}
                {savings > 0 ? ` · saved ${formatInr(savings)}` : ''}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <X color={TEXT_SEC} size={18} />
            </Pressable>
          </View>

          {(allowCod ? OPTIONS : OPTIONS.filter((option) => option.id !== 'cod')).map((option) => {
            const on = selected === option.id;
            const takeawayCash = isTakeaway && option.id === 'cod';
            const hint = option.id === 'wallet' && wallet
              ? `Balance ${formatInr(wallet.balance)}`
              : takeawayCash
                ? 'Pay at the restaurant when you collect'
                : option.hint;
            const Icon = takeawayCash ? Store : option.Icon;
            return (
              <Pressable
                key={option.id}
                style={[styles.row, on && styles.rowOn]}
                onPress={() => choose(option.id)}
              >
                <Icon color={on ? ORANGE : TEXT_SEC} size={18} strokeWidth={2.2} />
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{takeawayCash ? 'Pay at counter' : option.title}</Text>
                  <Text style={styles.rowHint}>{hint}</Text>
                </View>
                {on ? <Check color={ORANGE} size={16} strokeWidth={2.4} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: fonts.uiSemi,
    fontSize: 16,
    color: TEXT,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT_SEC,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  rowOn: {
    borderColor: ORANGE,
    backgroundColor: '#FFF7ED',
  },
  rowBody: { flex: 1 },
  rowTitle: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: TEXT,
  },
  rowHint: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
});
