import { Pressable } from '@/components/common/Pressable';
import { CreditCard, Truck, Wallet, X } from 'lucide-react-native';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

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
  onPay?: (method: string) => void;
  wallet?: WalletSummary;
  walletShortfall?: number | null;
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
  itemCount,
  total,
  savings,
  wallet,
  walletShortfall,
}: Props) {
  const router = useRouter();
  const selected = canonicalPayChoice(selectedMethod);

  const choose = (id: PayChoice) => {
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
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Pay using</Text>
              <Text style={styles.subtitle}>
                {itemCount} item{itemCount === 1 ? '' : 's'} · {formatInr(total)}
                {savings > 0 ? ` · saved ${formatInr(savings)}` : ''}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <X color={TEXT} size={20} />
            </Pressable>
          </View>

          <Text style={styles.amountLabel}>Amount to pay</Text>
          <Text style={styles.amount}>{formatInr(total)}</Text>

          {OPTIONS.map((option) => {
            const on = selected === option.id;
            const hint =
              option.id === 'online'
                ? `${formatInr(total)} opens in Razorpay with every payment option`
                : option.id === 'wallet' && wallet
                  ? `Balance ${formatInr(wallet.balance)} · bill ${formatInr(total)}`
                  : option.id === 'cod'
                    ? `Pay ${formatInr(total)} in cash at the door`
                    : option.hint;
            return (
              <Pressable
                key={option.id}
                style={[styles.row, on && styles.rowOn]}
                onPress={() => choose(option.id)}
              >
                <View style={[styles.icon, on && styles.iconOn]}>
                  <option.Icon color={on ? WHITE : ORANGE} size={18} strokeWidth={2.3} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{option.title}</Text>
                  <Text style={styles.rowHint}>{hint}</Text>
                </View>
                <View style={[styles.radio, on && styles.radioOn]} />
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: TEXT,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: TEXT_SEC,
  },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountLabel: {
    marginTop: 16,
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
  amount: {
    marginBottom: 12,
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: TEXT,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
  },
  rowOn: {
    borderColor: ORANGE,
    backgroundColor: '#FFF7ED',
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEDD5',
  },
  iconOn: { backgroundColor: ORANGE },
  rowBody: { flex: 1, marginLeft: 12 },
  rowTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: TEXT,
  },
  rowHint: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioOn: {
    borderColor: ORANGE,
    backgroundColor: ORANGE,
  },
});
