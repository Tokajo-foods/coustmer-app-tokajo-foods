import type { Order } from '@/lib/order/types';

/** Matches order-service `ACTIVE_STATUSES` (+ common aliases). */
const ONGOING = new Set([
  'pending_payment',
  'placed',
  'accepted',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
]);

const TERMINAL = new Set([
  'delivered',
  'cancelled',
  'rejected',
  'payment_failed',
  'partially_fulfilled',
  'returned',
]);

export function isOngoingOrderStatus(status: string | undefined | null): boolean {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  if (!s || TERMINAL.has(s)) return false;
  if (ONGOING.has(s)) return true;
  return !TERMINAL.has(s) && s !== 'scheduled';
}

export function pickPrimaryActiveOrder(orders: Order[] | undefined): Order | null {
  if (!orders?.length) return null;
  const hit = orders.find((o) => isOngoingOrderStatus(o.status));
  return hit ?? null;
}

export function ongoingOrderMessage(order: Pick<Order, 'orderNumber' | 'restaurantName'>): string {
  const label = order.orderNumber ? ` (#${order.orderNumber})` : '';
  const place = order.restaurantName ? ` from ${order.restaurantName}` : '';
  return `You already have an order in progress${label}${place}. Track it and wait until it is delivered or cancelled before placing another.`;
}
