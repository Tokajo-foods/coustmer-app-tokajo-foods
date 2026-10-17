import { createIdempotencyKey } from '@/lib/order/idempotency';
import { request } from '@/lib/payment/api';

const TOPUP_BASE = '/api/v1/payment-service/payments/wallet/topup';

export type WalletTopupMethod = 'upi' | 'card' | 'netbanking';

export type WalletTopupSession = {
  paymentId: string;
  amount: number;
  keyId: string;
  gatewayOrderId: string;
  currency: string;
};

export type WalletTopupVerifyPayload = {
  paymentId: string;
  gatewayPaymentId: string;
  gatewayOrderId: string;
  gatewaySignature: string;
};

export type WalletTopupVerifyResult = {
  paymentId: string;
  amount: number;
  status: string;
  userCredited: boolean;
};

export const walletTopupApi = {
  /** POST /payments/wallet/topup — creates a Razorpay order (Idempotency-Key required). */
  start: async (payload: { amount: number; method: WalletTopupMethod }): Promise<WalletTopupSession> => {
    const res = await request<Record<string, unknown>>(TOPUP_BASE, {
      method: 'POST',
      body: { amount: payload.amount, method: payload.method },
      headers: { 'Idempotency-Key': createIdempotencyKey('topup') },
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
      amount: Number(data.amount ?? payload.amount),
      keyId,
      gatewayOrderId,
      currency: String(session.currency ?? 'INR'),
    };
  },

  /** POST /payments/wallet/topup/verify — checks signature and credits the wallet. */
  verify: async (payload: WalletTopupVerifyPayload): Promise<WalletTopupVerifyResult> => {
    const res = await request<Record<string, unknown>>(`${TOPUP_BASE}/verify`, {
      method: 'POST',
      body: payload,
    });
    const data = (res.data ?? {}) as Record<string, unknown>;
    return {
      paymentId: String(data.paymentId ?? payload.paymentId),
      amount: Number(data.amount ?? 0),
      status: String(data.status ?? ''),
      userCredited: data.userCredited === true,
    };
  },
};
