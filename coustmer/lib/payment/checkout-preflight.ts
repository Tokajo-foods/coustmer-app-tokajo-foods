import { ensureWalletCoversCheckout } from '@/lib/cart/ensure-wallet-checkout';
import { paymentApi, request } from '@/lib/payment/api';
import { needsOnlinePayment } from '@/lib/payment/types';

type Context = {
  amount: number;
  restaurantId: string;
  isTakeaway: boolean;
  lat?: number;
  lng?: number;
  /** Scheduled orders cannot be cash on delivery. */
  scheduled?: boolean;
};

/** Same rules order-service enforces on place (`409 COD_NOT_AVAILABLE`); shown before an order exists. */
const COD_BLOCKED: Record<string, string> = {
  ZONE_COD_DISABLED: 'Cash on delivery is not available in your area. Please pay online.',
  ZONE_PREPAID_ONLY: 'Only online payment is accepted in your area right now.',
  COD_LIMIT: 'This order is above the cash on delivery limit. Please pay online.',
  RESTAURANT_COD_OFF: 'This restaurant does not accept cash on delivery. Please pay online.',
};

/** GET /payments/cod/eligibility */
async function codBlockMessage(ctx: Context): Promise<string | null> {
  if (ctx.isTakeaway || ctx.lat == null || ctx.lng == null) return null;
  const qs = new URLSearchParams({
    amount: String(Math.max(ctx.amount, 1)),
    lat: String(ctx.lat),
    lng: String(ctx.lng),
    restaurantId: ctx.restaurantId,
  });
  try {
    const res = await request<{ eligible?: boolean; reason?: string | null; maxCodAmount?: number }>(
      `/api/v1/payment-service/payments/cod/eligibility?${qs}`
    );
    const data = res.data;
    const message = data?.eligible === false ? COD_BLOCKED[data.reason ?? ''] : undefined;
    if (!message) return null;
    return data?.reason === 'COD_LIMIT' && data.maxCodAmount
      ? `${message} (limit ₹${data.maxCodAmount})`
      : message;
  } catch {
    return null; // order-service re-checks on place
  }
}

/** GET /payments/gateway/status — don't create an online order the gateway can't take. */
async function gatewayBlockMessage(isTakeaway: boolean): Promise<string | null> {
  try {
    const status = await paymentApi.getGatewayStatus();
    return status.configured
      ? null
      : isTakeaway
        ? 'Online payment is unavailable right now. Choose Pay at counter or try again in a few minutes.'
        : 'Online payment is unavailable right now. Choose Cash on delivery or try again in a few minutes.';
  } catch {
    return null; // initiate reports GATEWAY_UNAVAILABLE if it is really down
  }
}

/**
 * Checks the chosen method before POST /orders. Returns a message when the customer must pick
 * another method; throws when the wallet can't cover the bill.
 */
export async function preflightCheckoutMethod(method: string, ctx: Context): Promise<string | null> {
  if (method === 'wallet') {
    await ensureWalletCoversCheckout();
    return null;
  }
  if (method === 'cod') {
    if (ctx.scheduled) return 'Scheduled orders are paid online or with wallet.';
    return codBlockMessage(ctx);
  }
  if (needsOnlinePayment(method)) return gatewayBlockMessage(ctx.isTakeaway);
  return null;
}
