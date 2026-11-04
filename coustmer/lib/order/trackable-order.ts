import type { Order } from '@/lib/order/types';
import { normalizeOrderStatus } from '@/lib/order/types';
import { isValidOrderRouteId, resolveOrderRouteId } from '@/lib/order/order-route-id';

/** Kitchen + delivery — home “Track order” and live map (not unpaid checkout). */
const LIVE_TRACK_STATUSES = new Set([
  'placed',
  'accepted',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
]);

function hasTerminalTimestamp(order: Pick<Order, 'cancelledAt' | 'deliveredAt' | 'raw'>): boolean {
  if (order.cancelledAt || order.deliveredAt) return true;
  const raw = order.raw;
  if (!raw) return false;
  return Boolean(raw.cancelledAt || raw.deliveredAt || raw.completedAt);
}

export function isTrackableOrderStatus(status?: string | null): boolean {
  if (!status) return false;
  const s = normalizeOrderStatus(status);
  if (LIVE_TRACK_STATUSES.has(s)) return true;
  return s === 'pending_payment' || s === 'pending';
}

export function orderIsLiveTrackable(order: Order | null | undefined): boolean {
  if (!order) return false;
  if (!isValidOrderRouteId(resolveOrderRouteId(order))) return false;
  if (hasTerminalTimestamp(order)) return false;
  return LIVE_TRACK_STATUSES.has(normalizeOrderStatus(order.status));
}

/** Unpaid online checkout — show “Complete payment”, not live tracking. */
export function orderAwaitingOnlinePayment(order: Order | null | undefined): boolean {
  if (!order || !isValidOrderRouteId(resolveOrderRouteId(order))) return false;
  if (hasTerminalTimestamp(order)) return false;
  const s = normalizeOrderStatus(order.status);
  if (s !== 'pending_payment' && s !== 'pending') return false;
  const method = String(order.paymentMethod ?? order.raw?.paymentMethod ?? '').toLowerCase();
  return method !== 'cod';
}

/** GET /orders/active filter — includes payment-pending for checkout guards. */
export function orderIsTrackable(order: Order | null | undefined): boolean {
  if (!order) return false;
  if (!isValidOrderRouteId(resolveOrderRouteId(order))) return false;
  if (hasTerminalTimestamp(order)) return false;
  return isTrackableOrderStatus(order.status);
}
