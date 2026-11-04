import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { usePrimaryActiveOrder } from '@/lib/order/use-primary-active-order';
import { orderIsTrackable } from '@/lib/order/trackable-order';
import { orderKeys } from '@/lib/order/hooks';
import { refreshActiveOrdersAfterTerminal } from '@/lib/order/refresh-active-orders';
import { useSocketEvent } from '@/lib/socket/hooks';
import { useAuthStore } from '@/store/auth-store';
import { useActiveOrderStore } from '@/store/active-order-store';

/** Keeps `useActiveOrderStore` aligned with GET /orders/active. */
export function ActiveOrderSync() {
  const queryClient = useQueryClient();
  const loggedIn = Boolean(useAuthStore((s) => s.token));
  const { order, refetch } = usePrimaryActiveOrder();
  const setOrder = useActiveOrderStore((s) => s.setOrder);

  useEffect(() => {
    if (!loggedIn) {
      setOrder(null);
      queryClient.setQueryData(orderKeys.active(), []);
      return;
    }
    queryClient.removeQueries({ queryKey: orderKeys.active() });
    void refetch();
  }, [loggedIn, queryClient, refetch, setOrder]);

  useEffect(() => {
    setOrder(order && orderIsTrackable(order) ? order : null);
  }, [order, setOrder]);

  useSocketEvent('order:cancelled', (d) => {
    refreshActiveOrdersAfterTerminal(queryClient, d.orderId, 'cancelled');
  });

  useSocketEvent('order:status', (d) => {
    refreshActiveOrdersAfterTerminal(queryClient, d.orderId, d.status);
  });

  return null;
}
