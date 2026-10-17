import { useState } from 'react';
import { Alert } from 'react-native';

import type { RazorpayResult, RazorpaySession } from '@/components/payment/RazorpayCheckoutModal';
import type { SubscriptionPlan } from '@/lib/customer/types';
import {
  useStartSubscriptionPayment,
  useVerifySubscriptionPayment,
} from '@/lib/payment/hooks';

/** Super purchase: subscribe (server price) → Razorpay checkout → verify + activate. */
export function useSuperCheckout(contact?: { name?: string; email?: string; phone?: string }) {
  const start = useStartSubscriptionPayment();
  const verify = useVerifySubscriptionPayment();
  const [session, setSession] = useState<RazorpaySession | null>(null);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

  const begin = async (plan: SubscriptionPlan) => {
    if (busyPlanId) return;
    setBusyPlanId(plan.id);
    try {
      const s = await start.mutateAsync({ planId: plan.id, method: 'upi' });
      setSession({
        keyId: s.keyId,
        orderId: s.gatewayOrderId,
        amount: s.amount,
        currency: s.currency,
        paymentId: s.paymentId,
        customerName: contact?.name,
        email: contact?.email,
        contact: contact?.phone,
        description: `${plan.name} membership`,
      });
    } catch (e) {
      setBusyPlanId(null);
      Alert.alert('Could not start payment', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const onResult = async (success: boolean, data: RazorpayResult) => {
    const current = session;
    setSession(null);
    if (!current) {
      setBusyPlanId(null);
      return;
    }
    if (!success) {
      setBusyPlanId(null);
      if (data.reason !== 'dismissed') {
        Alert.alert('Payment failed', data.reason || 'Nothing was charged. Please try again.');
      }
      return;
    }
    try {
      const result = await verify.mutateAsync({
        paymentId: current.paymentId,
        gatewayPaymentId: data.gatewayPaymentId ?? '',
        gatewayOrderId: data.gatewayOrderId ?? current.orderId,
        gatewaySignature: data.gatewaySignature ?? '',
      });
      Alert.alert(
        result.customerActivated ? 'Welcome to Super' : 'Payment received',
        result.customerActivated
          ? 'Your membership is active. Benefits apply on your next order.'
          : 'We are activating your membership. It will show here in a few minutes.'
      );
    } catch {
      Alert.alert(
        'Payment received',
        'We are confirming your payment. Your membership will activate automatically.'
      );
    } finally {
      setBusyPlanId(null);
    }
  };

  const close = () => {
    setSession(null);
    setBusyPlanId(null);
  };

  return { session, busyPlanId, begin, onResult, close };
}
