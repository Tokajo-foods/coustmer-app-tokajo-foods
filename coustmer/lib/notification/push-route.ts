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

  const orderId = str(data.orderId ?? data.order_id ?? data.order);
  if (orderId && kind === 'restaurant_chat') {
    return {
      pathname: '/orders/[orderId]/restaurant-chat',
      params: { orderId, restaurantName: str(data.restaurantName) || 'Restaurant' },
    };
  }
  if (orderId) {
    const tracking =
      str(data.screen) === 'order_tracking' || TRACKING_STATUSES.has(str(data.status));
    return {
      pathname: tracking ? '/orders/[orderId]/tracking' : '/orders/[orderId]',
      params: { orderId },
    };
  }

  const restaurantId = str(data.restaurantId ?? data.restaurant_id ?? data.restaurant);
  if (restaurantId) {
    return {
      pathname: `/restaurants/${encodeURIComponent(restaurantId)}`,
      params: {},
    };
  }
  const paymentId = str(data.paymentId ?? data.payment_id ?? data.payment);
  if (paymentId) {
    return { pathname: '/payments/[paymentId]', params: { paymentId } };
  }
  return null;
}
