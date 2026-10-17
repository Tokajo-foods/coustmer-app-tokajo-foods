import { orderApi } from '@/lib/order/api';
import { normalizeOrderStatus } from '@/lib/order/types';
import { PaymentApiError } from '@/lib/payment/api';

export type PaymentConfirmation =
  | { kind: 'placed' }
  | { kind: 'refunded'; message: string }
  | { kind: 'failed'; message: string }
  | { kind: 'pending'; message: string };

/** Server refunded (or is refunding) the money; the order will not go ahead. */
const REFUNDED_CODES = new Set(['ORDER_NOT_PLACED_REFUNDED', 'PAYMENT_AMOUNT_MISMATCH']);
/** Checkout result was not a real payment for this order — nothing to wait for. */
const FAILED_CODES = new Set(['INVALID_SIGNATURE', 'GATEWAY_ORDER_MISMATCH']);

const LIVE_STATUSES = new Set([
  'placed', 'accepted', 'confirmed', 'preparing', 'ready',
  'out_for_delivery', 'delivered', 'scheduled',
]);

const POLL_EVERY_MS = 3000;
const POLL_FOR_MS = 30_000;

const REFUND_MESSAGE =
  'Your order could not be confirmed. A full refund of the amount paid has been started to your original payment method.';
const PENDING_MESSAGE =
  'Payment received. We are still confirming your order with the restaurant. If it cannot be confirmed, the money is refunded automatically — you do not need to do anything.';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * After Razorpay reports success: verify with the server. If verify can't give a final answer
 * (network blip, order still settling), watch the order — the server places it or refunds on its own.
 */
export async function confirmOrderPayment(
  verify: () => Promise<unknown>,
  orderId: string
): Promise<PaymentConfirmation> {
  try {
    await verify();
    return { kind: 'placed' };
  } catch (err) {
    const code = err instanceof PaymentApiError ? err.code : undefined;
    const message = err instanceof Error ? err.message : '';
    if (code && REFUNDED_CODES.has(code)) return { kind: 'refunded', message: message || REFUND_MESSAGE };
    if (code && FAILED_CODES.has(code)) {
      return {
        kind: 'failed',
        message: 'This payment could not be verified. If money was deducted it will be refunded automatically.',
      };
    }
    return watchOrder(orderId);
  }
}

async function watchOrder(orderId: string): Promise<PaymentConfirmation> {
  const deadline = Date.now() + POLL_FOR_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_EVERY_MS);
    try {
      const order = await orderApi.getOrder(orderId);
      const status = normalizeOrderStatus(order.status);
      if (LIVE_STATUSES.has(status)) return { kind: 'placed' };
      if (
        status === 'payment_failed'
        || status === 'cancelled'
        || normalizeOrderStatus(order.paymentStatus) === 'refunded'
      ) {
        return { kind: 'refunded', message: REFUND_MESSAGE };
      }
    } catch {
      // Keep watching; a flaky network is exactly why we're polling.
    }
  }
  return { kind: 'pending', message: PENDING_MESSAGE };
}
