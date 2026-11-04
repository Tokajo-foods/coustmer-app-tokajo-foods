import type { QueryClient } from '@tanstack/react-query';
import type { Router } from 'expo-router';

import { orderKeys } from '@/lib/order/hooks';
import { orderApi } from '@/lib/order/api';
import { orderIsLiveTrackable } from '@/lib/order/trackable-order';
import { orderTrackingHref } from '@/lib/order/order-tracking-path';
import { isValidOrderRouteId, resolveOrderRouteId } from '@/lib/order/order-route-id';
import type { Order } from '@/lib/order/types';
import { useActiveOrderStore } from '@/store/active-order-store';

async function resolveLiveTrackOrder(fallback?: Order | null): Promise<Order | null> {
  const fromStore = useActiveOrderStore.getState().order;
  const candidates = [fallback, fromStore].filter(Boolean) as Order[];
  for (const row of candidates) {
    const id = resolveOrderRouteId(row);
    if (isValidOrderRouteId(id) && orderIsLiveTrackable(row)) return { ...row, id };
  }
  const active = await orderApi.getActiveOrders().catch(() => [] as Order[]);
  return active.find((o) => isValidOrderRouteId(o.id) && orderIsLiveTrackable(o)) ?? null;
}

/** Home track pill — live kitchen / delivery map only (not awaiting payment). */
export async function openOrderTracking(
  nav: Router,
  queryClient: QueryClient,
  order: Order,
): Promise<boolean> {
  const hit = await resolveLiveTrackOrder(order);
  if (!hit?.id) return false;

  const full = await queryClient.fetchQuery({
    queryKey: orderKeys.detail(hit.id),
    queryFn: () => orderApi.getOrder(hit.id),
  });
  queryClient.setQueryData(orderKeys.active(), [full]);
  nav.push(orderTrackingHref(hit.id));
  return true;
}
