import type { Order } from '@/lib/order/types';
import { isActiveOrderStatus } from '@/lib/order/types';

/** True while the customer should see track / one-order-at-a-time guards. */
export function isOngoingOrderStatus(status: string | undefined | null): boolean {
  if (!status) return false;
  return isActiveOrderStatus(status);
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
