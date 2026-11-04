import type { QueryClient } from '@tanstack/react-query';
import type { Router } from 'expo-router';

import { orderKeys } from '@/lib/order/hooks';
import { orderApi } from '@/lib/order/api';
import { orderIsTrackable } from '@/lib/order/trackable-order';
import { resolveOrderRouteId } from '@/lib/order/order-route-id';
import type { Order } from '@/lib/order/types';

/** Home track pill / push — open live tracking with a warm detail cache. */
export async function openOrderTracking(
  nav: Router,
  queryClient: QueryClient,
  order: Order,
): Promise<boolean> {
  const orderId = resolveOrderRouteId(order);
  if (!orderId) {
    const active = await orderApi.getActiveOrders().catch(() => [] as Order[]);
    const hit = active.find((o) => orderIsTrackable(o));
    if (!hit) return false;
    queryClient.setQueryData(orderKeys.detail(hit.id), hit);
    queryClient.setQueryData(orderKeys.active(), active);
    nav.push({
      pathname: '/orders/[orderId]/tracking',
      params: { orderId: hit.id },
    });
    return true;
  }

  queryClient.setQueryData(orderKeys.detail(orderId), order);
  nav.push({
    pathname: '/orders/[orderId]/tracking',
    params: { orderId },
  });
  return true;
}
