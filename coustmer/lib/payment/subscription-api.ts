import { createIdempotencyKey } from '@/lib/order/idempotency';
import { request } from '@/lib/payment/api';

const SUBSCRIPTIONS_BASE = '/api/v1/payment-service/payments/subscriptions';

export type SubscriptionPayMethod = 'upi' | 'card' | 'netbanking';

export type SubscriptionCheckoutSession = {
  paymentId: string;
  planKey: string;
  amount: number;
  keyId: string;
  gatewayOrderId: string;
  currency: string;
};

export type SubscriptionVerifyPayload = {
  paymentId: string;
  gatewayPaymentId: string;
  gatewayOrderId: string;
  gatewaySignature: string;
};

export type SubscriptionVerifyResult = {
  paymentId: string;
  planKey: string;
  status: string;
  customerActivated: boolean;
};

export const subscriptionPaymentApi = {
  /** POST /payments/subscriptions/subscribe — price comes from the server plan catalog. */
  start: async (payload: {
    planId: string;
    method: SubscriptionPayMethod;
  }): Promise<SubscriptionCheckoutSession> => {
    const res = await request<Record<string, unknown>>(`${SUBSCRIPTIONS_BASE}/subscribe`, {
      method: 'POST',
      body: {
        planId: payload.planId,
        method: payload.method,
        gateway: 'razorpay',
        idempotencyKey: createIdempotencyKey('sub'),
      },
    });
    const data = (res.data ?? {}) as Record<string, unknown>;
    const session = (data.gatewaySession ?? {}) as Record<string, unknown>;
    const keyId = String(session.key_id ?? '');
    const gatewayOrderId = String(session.id ?? '');
    if (!keyId || !gatewayOrderId) {
      throw new Error('Online payment is not available right now. Please try again later.');
    }
    return {
      paymentId: String(data.paymentId ?? ''),
      planKey: String(data.planKey ?? payload.planId),
      amount: Number(data.amount ?? 0),
      keyId,
      gatewayOrderId,
      currency: String(session.currency ?? 'INR'),
    };
  },

  /** POST /payments/subscriptions/verify — signature check, then activates Super. */
  verify: async (payload: SubscriptionVerifyPayload): Promise<SubscriptionVerifyResult> => {
    const res = await request<Record<string, unknown>>(`${SUBSCRIPTIONS_BASE}/verify`, {
      method: 'POST',
      body: payload,
    });
    const data = (res.data ?? {}) as Record<string, unknown>;
    return {
      paymentId: String(data.paymentId ?? payload.paymentId),
      planKey: String(data.planKey ?? ''),
      status: String(data.status ?? ''),
      customerActivated: data.customerActivated === true,
    };
  },
};
