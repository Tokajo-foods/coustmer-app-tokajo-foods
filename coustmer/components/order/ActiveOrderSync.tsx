import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useActiveOrders } from '@/lib/order/hooks';
import {
  pickPrimaryActiveOrder,
  pickRecentLiveActiveOrder,
} from '@/lib/order/ongoing-order';
import { refreshActiveOrdersAfterTerminal } from '@/lib/order/refresh-active-orders';
import { orderIsTrackable } from '@/lib/order/trackable-order';
import { useSocketEvent } from '@/lib/socket/hooks';
import { useAuthStore } from '@/store/auth-store';
import { useActiveOrderStore } from '@/store/active-order-store';

/** Keeps `useActiveOrderStore` aligned with GET /orders/active. */
export function ActiveOrderSync() {
  const queryClient = useQueryClient();
  const loggedIn = Boolean(useAuthStore((s) => s.token));
  const query = useActiveOrders({ enabled: loggedIn, refetchInterval: 20_000 });
  const setOrder = useActiveOrderStore((s) => s.setOrder);

  useEffect(() => {
    if (!loggedIn) {
      setOrder(null);
      return;
    }
    void query.refetch();
  }, [loggedIn, query.refetch, setOrder]);

  useEffect(() => {
    if (!loggedIn) return;
    const live = pickRecentLiveActiveOrder(query.data);
    const primary = pickPrimaryActiveOrder(query.data);
    const next = live ?? (primary && orderIsTrackable(primary) ? primary : null);
    setOrder(next);
  }, [loggedIn, query.data, setOrder]);

  useSocketEvent('order:cancelled', (d) => {
    refreshActiveOrdersAfterTerminal(queryClient, d.orderId, 'cancelled');
  });

  useSocketEvent('order:status', (d) => {
    refreshActiveOrdersAfterTerminal(queryClient, d.orderId, d.status);
  });

  return null;
}
