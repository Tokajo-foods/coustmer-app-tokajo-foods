import type { QueryClient } from '@tanstack/react-query';
import type { Router } from 'expo-router';

import { orderKeys } from '@/lib/order/hooks';
import { orderApi } from '@/lib/order/api';
import { orderIsTrackable } from '@/lib/order/trackable-order';
import { orderTrackingHref } from '@/lib/order/order-tracking-path';
import { isValidOrderRouteId, resolveOrderRouteId } from '@/lib/order/order-route-id';
import type { Order } from '@/lib/order/types';
import { useActiveOrderStore } from '@/store/active-order-store';

async function resolveActiveTrackableOrder(fallback?: Order | null): Promise<Order | null> {
  const fromStore = useActiveOrderStore.getState().order;
  const candidates = [fallback, fromStore].filter(Boolean) as Order[];
  for (const row of candidates) {
    const id = resolveOrderRouteId(row);
    if (isValidOrderRouteId(id) && orderIsTrackable(row)) return { ...row, id };
  }
  const active = await orderApi.getActiveOrders().catch(() => [] as Order[]);
  return active.find((o) => isValidOrderRouteId(o.id) && orderIsTrackable(o)) ?? null;
}

/** Home track pill / push — open live tracking with a warm detail cache. */
export async function openOrderTracking(
  nav: Router,
  queryClient: QueryClient,
  order: Order,
): Promise<boolean> {
  const hit = await resolveActiveTrackableOrder(order);
  if (!hit?.id) return false;

  queryClient.setQueryData(orderKeys.detail(hit.id), hit);
  queryClient.setQueryData(orderKeys.active(), [hit]);
  nav.push(orderTrackingHref(hit.id));
  return true;
}
