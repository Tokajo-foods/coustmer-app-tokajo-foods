import type { Order } from '@/lib/order/types';
import { normalizeOrderStatus } from '@/lib/order/types';
import { isValidOrderRouteId, resolveOrderRouteId } from '@/lib/order/order-route-id';

/** Same set as order-service ACTIVE_STATUSES (+ confirmed / pending aliases). */
const TRACKABLE_STATUSES = new Set([
  'pending',
  'pending_payment',
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
  return TRACKABLE_STATUSES.has(normalizeOrderStatus(status));
}

/** Home track pill + GET /orders/active — strict, never guess from unknown statuses. */
export function orderIsTrackable(order: Order | null | undefined): boolean {
  if (!order) return false;
  if (!isValidOrderRouteId(resolveOrderRouteId(order))) return false;
  if (hasTerminalTimestamp(order)) return false;
  return isTrackableOrderStatus(order.status);
}
