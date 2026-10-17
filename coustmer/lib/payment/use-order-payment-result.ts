import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import type { RazorpayResult } from '@/components/payment/RazorpayCheckoutModal';
import {
  confirmOrderPayment,
  type PaymentConfirmation,
} from '@/lib/payment/confirm-order-payment';
import { useVerifyPayment } from '@/lib/payment/hooks';

const TITLES: Record<Exclude<PaymentConfirmation['kind'], 'placed'>, string> = {
  refunded: 'Refund started',
  failed: 'Payment not verified',
  pending: 'Confirming your order',
};

/**
 * Razorpay said "paid" → verify with the server and route the customer.
 * Placed goes to tracking; anything else explains what happens to the money and opens the order.
 */
export function useOrderPaymentResult() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const verify = useVerifyPayment();
  const [confirming, setConfirming] = useState(false);

  const confirm = useCallback(
    async (orderId: string, paymentId: string, data: RazorpayResult): Promise<PaymentConfirmation> => {
      setConfirming(true);
      const result = await confirmOrderPayment(
        () =>
          verify.mutateAsync({
            paymentId,
            orderId,
            gatewayPaymentId: data.gatewayPaymentId,
            gatewayOrderId: data.gatewayOrderId,
            gatewaySignature: data.gatewaySignature,
            status: 'success',
          }),
        orderId
      );
      setConfirming(false);
      void queryClient.invalidateQueries({ queryKey: ['order'] });

      if (result.kind === 'placed') {
        router.replace({
          pathname: '/orders/[orderId]/tracking',
          params: { orderId, newOrder: 'true' },
        });
        return result;
      }

      Alert.alert(TITLES[result.kind], result.message, [
        {
          text: 'View order',
          onPress: () =>
            router.replace({ pathname: '/orders/[orderId]', params: { orderId } }),
        },
      ]);
      return result;
    },
    [queryClient, router, verify]
  );

  return { confirm, confirming };
}
