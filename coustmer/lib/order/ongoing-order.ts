import type { Order } from '@/lib/order/types';
import { isActiveOrderStatus } from '@/lib/order/types';
import { orderIsLiveTrackable, orderIsTrackable } from '@/lib/order/trackable-order';

/** True while the customer should see track / one-order-at-a-time guards. */
export function isOngoingOrderStatus(status: string | undefined | null): boolean {
  if (!status) return false;
  return isActiveOrderStatus(status);
}

export function orderRecencyMs(order: Pick<Order, 'createdAt' | 'raw'>): number {
  const raw = order.createdAt ?? order.raw?.createdAt ?? order.raw?.placedAt;
  const t = raw ? Date.parse(String(raw)) : 0;
  return Number.isFinite(t) ? t : 0;
}

/** Live kitchen/delivery first, then newest within each tier. */
export function sortActiveOrdersForCustomer(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const aLive = orderIsLiveTrackable(a) ? 0 : 1;
    const bLive = orderIsLiveTrackable(b) ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    return orderRecencyMs(b) - orderRecencyMs(a);
  });
}

export function pickPrimaryActiveOrder(orders: Order[] | undefined): Order | null {
  if (!orders?.length) return null;
  const trackable = sortActiveOrdersForCustomer(orders.filter((o) => orderIsTrackable(o)));
  return trackable[0] ?? null;
}

/** Most recent placed → out_for_delivery order (home “Track order” pill). */
export function pickRecentLiveActiveOrder(orders: Order[] | undefined): Order | null {
  if (!orders?.length) return null;
  const live = sortActiveOrdersForCustomer(orders.filter((o) => orderIsLiveTrackable(o)));
  return live[0] ?? null;
}

export function ongoingOrderMessage(order: Pick<Order, 'orderNumber' | 'restaurantName'>): string {
  const label = order.orderNumber ? ` (#${order.orderNumber})` : '';
  const place = order.restaurantName ? ` from ${order.restaurantName}` : '';
  return `You already have an order in progress${label}${place}. Track it and wait until it is delivered or cancelled before placing another.`;
}
