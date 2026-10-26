import { NativeModules, TurboModuleRegistry } from 'react-native';

import type { RazorpayResult, RazorpaySession } from '@/components/payment/RazorpayCheckoutModal';
import { upiIntentConfig } from '@/lib/payment/upi-app';

type NativeSuccess = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type NativeError = { code?: number | string; description?: string; error?: { description?: string } };

/** True only in an EAS / dev-client build that includes react-native-razorpay. Expo Go → false. */
export function isNativeRazorpayAvailable(): boolean {
  try {
    return Boolean(TurboModuleRegistry.get('RNRazorpayCheckout') ?? NativeModules.RNRazorpayCheckout);
  } catch {
    return false;
  }
}

function errorReason(err: NativeError): string {
  const code = Number(err?.code);
  // Android: 0 = PAYMENT_CANCELLED; iOS: 2 = user dismissed.
  if (code === 0 || code === 2) return 'dismissed';
  let desc = err?.description ?? '';
  try {
    const parsed = JSON.parse(desc) as NativeError;
    desc = parsed?.error?.description ?? parsed?.description ?? desc;
  } catch {
    // description is plain text
  }
  return desc || 'payment_failed';
}

/** Opens native Razorpay checkout (UPI intent: GPay / PhonePe / Paytm, cards, netbanking, wallets). */
export async function openNativeRazorpay(
  session: RazorpaySession
): Promise<{ success: boolean; data: RazorpayResult }> {
  // Lazy require: the SDK builds a NativeEventEmitter at import time and crashes without the native module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RazorpayCheckout = require('react-native-razorpay').default;
  try {
    const res = (await RazorpayCheckout.open({
      key: session.keyId,
      order_id: session.orderId,
      currency: session.currency || 'INR',
      name: 'Tokajo Foods',
      description: session.description || 'Order payment',
      prefill: {
        name: session.customerName ?? '',
        email: session.email ?? '',
        contact: session.contact ?? '',
      },
      theme: { color: '#F97316' },
      retry: { enabled: true, max_count: 3 },
      send_sms_hash: true,
      ...(session.upiApp
        ? {
            method: { upi: true, card: false, netbanking: false, wallet: false },
            config: upiIntentConfig(session.upiApp),
          }
        : {}),
    })) as NativeSuccess;
    return {
      success: Boolean(res?.razorpay_payment_id),
      data: {
        gatewayPaymentId: res?.razorpay_payment_id,
        gatewayOrderId: res?.razorpay_order_id,
        gatewaySignature: res?.razorpay_signature,
        reason: res?.razorpay_payment_id ? undefined : 'payment_failed',
      },
    };
  } catch (err) {
    return { success: false, data: { reason: errorReason(err as NativeError) } };
  }
}
