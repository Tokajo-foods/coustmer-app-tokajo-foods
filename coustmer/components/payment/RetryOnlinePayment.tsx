import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import {
  RazorpayCheckoutModal,
  type RazorpayResult,
  type RazorpaySession,
} from '@/components/payment/RazorpayCheckoutModal';
import { fonts } from '@/constants/typography';
import { normalizeOrderStatus } from '@/lib/order/types';
import { useInitiatePayment } from '@/lib/payment/hooks';
import { needsOnlinePayment } from '@/lib/payment/types';
import { useOrderPaymentResult } from '@/lib/payment/use-order-payment-result';
import { formatInr } from '@/lib/format/money';

const ORANGE = '#F97316';
const WHITE = '#FFFFFF';
const TEXT = '#111827';
const MUTED = '#6B7280';

type Props = {
  orderId: string;
  amount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
};

/**
 * Shown when an online order is still unpaid. Re-opens Razorpay on the same
 * payment (the backend reuses or refreshes the gateway order).
 */
export function RetryOnlinePayment({
  orderId,
  amount,
  paymentMethod,
  paymentStatus,
  orderStatus,
}: Props) {
  const router = useRouter();
  const initiate = useInitiatePayment();
  const { confirm, confirming } = useOrderPaymentResult();
  const [session, setSession] = useState<RazorpaySession | null>(null);
  const [open, setOpen] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Expired / cancelled orders can't be paid any more (server answers ORDER_NOT_AWAITING_PAYMENT).
  const awaitingPayment = !orderStatus || normalizeOrderStatus(orderStatus) === 'pending_payment';
  const unpaid =
    needsOnlinePayment(paymentMethod) &&
    awaitingPayment &&
    ['pending', 'initiated', 'failed', 'pending_payment'].includes(
      String(paymentStatus ?? orderStatus ?? '').toLowerCase()
    );

  if (!unpaid || amount <= 0) return null;

  const pay = async () => {
    const method = ['card', 'netbanking', 'upi', 'emi'].includes(
      String(paymentMethod)
    )
      ? (paymentMethod as 'card' | 'netbanking' | 'upi' | 'emi')
      : 'upi';
    try {
      const payment = await initiate.mutateAsync({
        orderId,
        amount,
        currency: 'INR',
        method,
        description: `Order ${orderId}`,
      });
      if (payment.status === 'success' || payment.status === 'paid') {
        router.replace({
          pathname: '/orders/[orderId]/tracking',
          params: { orderId },
        });
        return;
      }
      const key = payment.razorpayKey;
      const rzpOrderId = payment.gatewayOrderId || payment.razorpayOrderId;
      if (!key || !rzpOrderId) {
        Alert.alert(
          'Online payment unavailable',
          'The payment window is not ready yet. Try again in a moment, or contact support.'
        );
        return;
      }
      setPaymentId(payment.id);
      setSession({
        keyId: key,
        orderId: rzpOrderId,
        amount,
        currency: 'INR',
        paymentId: payment.id,
        description: `Order ${orderId}`,
      });
      setOpen(true);
    } catch (err) {
      Alert.alert(
        'Could not open payment',
        err instanceof Error ? err.message : 'Please try again.'
      );
    }
  };

  const onResult = async (success: boolean, data: RazorpayResult) => {
    setOpen(false);
    if (!success || !paymentId) {
      Alert.alert(
        'Payment not completed',
        'No money was taken. You can try again from this order.'
      );
      return;
    }
    await confirm(orderId, paymentId, data);
  };

  const busy = initiate.isPending || confirming;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ShieldCheck color={ORANGE} size={22} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Payment pending</Text>
          <Text style={styles.sub}>
            Pay {formatInr(amount)} in the secure Razorpay window. UPI, cards, and
            netbanking are inside it.
          </Text>
        </View>
      </View>
      <Pressable style={styles.btn} onPress={() => void pay()} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={WHITE} />
        ) : (
          <Text style={styles.btnText}>Pay {formatInr(amount)}</Text>
        )}
      </Pressable>

      <RazorpayCheckoutModal
        visible={open}
        session={session}
        onClose={() => setOpen(false)}
        onResult={(ok, data) => void onResult(ok, data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  title: { fontFamily: fonts.uiBold, fontSize: 15, color: TEXT },
  sub: { fontFamily: fonts.ui, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 18 },
  btn: {
    marginTop: 14,
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: fonts.uiBold, fontSize: 15, color: WHITE },
});
