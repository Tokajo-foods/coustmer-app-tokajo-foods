import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import type { RazorpayResult, RazorpaySession } from '@/components/payment/RazorpayCheckoutModal';
import type { PlacementPhase } from '@/components/order/OrderPlacementModal';
import { orderApi } from '@/lib/order/api';
import { normalizeOrderStatus } from '@/lib/order/types';
import { PaymentApiError } from '@/lib/payment/api';
import { useInitiatePayment } from '@/lib/payment/hooks';
import type { PaymentMethodType } from '@/lib/payment/types';
import { useOrderPaymentResult } from '@/lib/payment/use-order-payment-result';

/** Online order created and waiting for money. Retries pay this order — never create a second one. */
export type UnpaidOrder = {
  id: string;
  orderNumber?: string;
  amount: number;
  method: PaymentMethodType;
  methodId?: string;
};

type Options = {
  customerName?: string;
  contact?: string;
  setPhase: (phase: PlacementPhase) => void;
};

const LIVE = new Set(['placed', 'accepted', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'scheduled']);

const SAVED_NOTE =
  'Your order is saved — pay within 15 minutes to confirm it. If money was deducted, it is confirmed or refunded automatically.';

/** Checkout screen: initiate → Razorpay → verify, with retry on the same order after a failure or cancel. */
export function useCheckoutPayment({ customerName, contact, setPhase }: Options) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const initiate = useInitiatePayment();
  const { confirm } = useOrderPaymentResult();
  const [unpaid, setUnpaid] = useState<UnpaidOrder | null>(null);
  const [session, setSession] = useState<RazorpaySession | null>(null);
  const [open, setOpen] = useState(false);

  const goTracking = useCallback(
    (orderId: string) =>
      router.replace({ pathname: '/orders/[orderId]/tracking', params: { orderId, newOrder: 'true' } }),
    [router]
  );
  const goOrder = useCallback(
    (orderId: string) => router.replace({ pathname: '/orders/[orderId]', params: { orderId } }),
    [router]
  );

  const pay = useCallback(
    async (order: UnpaidOrder): Promise<void> => {
      setUnpaid(order);
      try {
        const payment = await initiate.mutateAsync({
          orderId: order.id,
          amount: order.amount,
          currency: 'INR',
          method: order.method,
          methodId: order.methodId,
          description: `Order ${order.orderNumber || order.id}`,
        });
        if (payment.status === 'success' || payment.status === 'paid') {
          setUnpaid(null);
          goTracking(order.id);
          return;
        }
        const keyId = payment.razorpayKey;
        const rzpOrderId = payment.gatewayOrderId || payment.razorpayOrderId;
        if (!keyId || !rzpOrderId) {
          throw new PaymentApiError('Online payment is not ready yet. Try again in a moment.', 503, 'GATEWAY_UNAVAILABLE');
        }
        setSession({
          keyId,
          orderId: rzpOrderId,
          amount: payment.amount || order.amount,
          currency: 'INR',
          paymentId: payment.id,
          customerName,
          contact,
          description: `Order ${order.orderNumber || order.id}`,
        });
        setOpen(true);
      } catch (err) {
        const code = err instanceof PaymentApiError ? err.code : undefined;
        if (code === 'ORDER_NOT_AWAITING_PAYMENT') {
          setUnpaid(null);
          Alert.alert('Order can no longer be paid', 'This order expired or was cancelled. Nothing was charged.', [
            { text: 'View order', onPress: () => goOrder(order.id) },
          ]);
          return;
        }
        Alert.alert(
          'Online payment unavailable',
          `${err instanceof Error && err.message ? err.message : 'Payment is temporarily unavailable.'}\n\n${SAVED_NOTE}`,
          [
            { text: 'View order', onPress: () => goOrder(order.id) },
            { text: 'Try again', onPress: () => void pay(order) },
          ]
        );
      } finally {
        setPhase('none');
      }
    },
    [contact, customerName, goOrder, goTracking, initiate, setPhase]
  );

  /** Sheet closed without a success callback. A UPI app may still have paid — ask the server once. */
  const onNotPaid = useCallback(
    async (order: UnpaidOrder, reason?: string) => {
      setPhase('placing');
      const status = await orderApi
        .getOrder(order.id)
        .then((o) => normalizeOrderStatus(o.status))
        .catch(() => '');
      setPhase('none');
      void queryClient.invalidateQueries({ queryKey: ['order'] });
      if (LIVE.has(status)) {
        setUnpaid(null);
        goTracking(order.id);
        return;
      }
      if (status && status !== 'pending_payment') {
        setUnpaid(null);
        Alert.alert('Order not confirmed', 'Payment was not completed in time, so this order was closed.', [
          { text: 'View order', onPress: () => goOrder(order.id) },
        ]);
        return;
      }
      const cancelled = reason === 'dismissed';
      const detail = !cancelled && reason && reason !== 'payment_failed' ? `${reason}\n\n` : '';
      Alert.alert(cancelled ? 'Payment cancelled' : 'Payment failed', `${detail}${SAVED_NOTE}`, [
        { text: 'View order', onPress: () => goOrder(order.id) },
        { text: 'Retry payment', onPress: () => void pay(order) },
      ]);
    },
    [goOrder, goTracking, pay, queryClient, setPhase]
  );

  const onResult = useCallback(
    async (success: boolean, data: RazorpayResult) => {
      setOpen(false);
      const order = unpaid;
      const paymentId = session?.paymentId;
      if (!order) return;
      if (!success || !paymentId) {
        await onNotPaid(order, data.reason);
        return;
      }
      setPhase('placing');
      const result = await confirm(order.id, paymentId, data);
      setPhase('none');
      if (result.kind === 'placed' || result.kind === 'refunded' || result.kind === 'pending') setUnpaid(null);
    },
    [confirm, onNotPaid, session?.paymentId, setPhase, unpaid]
  );

  const close = useCallback(() => {
    setOpen(false);
    if (unpaid) void onNotPaid(unpaid, 'dismissed');
  }, [onNotPaid, unpaid]);

  return { unpaid, session, open, initiating: initiate.isPending, pay, onResult, close };
}
