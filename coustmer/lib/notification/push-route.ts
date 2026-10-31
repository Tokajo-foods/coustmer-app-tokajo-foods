export type NotificationRoute = {
  pathname: string;
  params: Record<string, string>;
};

/** Order states where the live tracking screen is the useful destination. */
const TRACKING_STATUSES = new Set([
  'placed',
  'confirmed',
  'accepted',
  'preparing',
  'ready',
  'picked_up',
  'out_for_delivery',
]);

/** Rider trip milestones from delivery-service (always open live tracking). */
const TRIP_TRACK_KINDS = new Set([
  'rider_assigned',
  'rider_reassigned',
  'rider_at_restaurant',
  'order_picked_up',
  'rider_nearby',
  'rider_arrived',
  'customer_unreachable',
  'delivery_delayed',
  'order_returning',
]);

/** Order is over — open the summary (bill, rate, help), not live tracking. */
const FINISHED_KINDS = new Set([
  'order_delivered', 'order_returned', 'order_cancelled', 'order_rejected',
  'restaurant_cancelled', 'accept_timeout', 'no_partner_available',
]);

const WALLET_STATUSES = new Set(['wallet_credited', 'wallet_debited']);

const PROMO_CATEGORIES = new Set(['offer', 'offers', 'promo', 'promotion', 'marketing']);

function str(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

/** Where a push tap or inbox row should open. Call pushes are owned by the call listeners. */
export function routeForNotificationData(raw: unknown): NotificationRoute | null {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const kind = str(data.kind);
  if (kind.startsWith('internet_call') || str(data.pushStyle)) return null;

  const ticketId = str(data.ticketId ?? data.ticket_id);
  if (ticketId) {
    return { pathname: '/support/[ticketId]', params: { ticketId } };
  }

  const orderId = str(data.orderId ?? data.order_id ?? data.order);
  if (orderId && kind === 'restaurant_chat') {
    return {
      pathname: '/orders/[orderId]/restaurant-chat',
      params: { orderId, restaurantName: str(data.restaurantName) || 'Restaurant' },
    };
  }
  if (orderId && (kind === 'partner_chat' || kind === 'rider_chat')) {
    return {
      pathname: '/orders/[orderId]/partner-chat',
      params: { orderId, partnerName: str(data.partnerName ?? data.riderName) || 'Delivery partner' },
    };
  }
  if (orderId) {
    const screen = str(data.screen);
    const tracking =
      !FINISHED_KINDS.has(kind) &&
      screen !== 'order_detail' &&
      (screen === 'order_tracking' || TRIP_TRACK_KINDS.has(kind) || TRACKING_STATUSES.has(str(data.status)));
    return {
      pathname: tracking ? '/orders/[orderId]/tracking' : '/orders/[orderId]',
      params: { orderId },
    };
  }

  const restaurantId = str(data.restaurantId ?? data.restaurant_id ?? data.restaurant);
  if (restaurantId) {
    return {
      pathname: '/restaurants/[restaurantId]',
      params: { restaurantId },
    };
  }
  const status = str(data.status);
  if (WALLET_STATUSES.has(status) || (status === 'refund_success' && str(data.method) === 'wallet')) {
    return { pathname: '/profile/wallet', params: {} };
  }
  const paymentId = str(data.paymentId ?? data.payment_id ?? data.payment);
  if (paymentId) {
    return { pathname: '/payments/[paymentId]', params: { paymentId } };
  }
  const category = str(data.category);
  if (PROMO_CATEGORIES.has(category)) {
    return { pathname: '/deals', params: {} };
  }
  if (category === 'announcement') {
    return { pathname: '/notifications', params: {} };
  }
  return null;
}
