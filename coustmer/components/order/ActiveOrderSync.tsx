import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { usePrimaryActiveOrder } from '@/lib/order/use-primary-active-order';
import { refreshActiveOrdersAfterTerminal } from '@/lib/order/refresh-active-orders';
import { useSocketEvent } from '@/lib/socket/hooks';
import { useActiveOrderStore } from '@/store/active-order-store';

/** Keeps `useActiveOrderStore` aligned with GET /orders/active. */
export function ActiveOrderSync() {
  const queryClient = useQueryClient();
  const { order } = usePrimaryActiveOrder();
  const setOrder = useActiveOrderStore((s) => s.setOrder);

  useEffect(() => {
    setOrder(order);
  }, [order, setOrder]);

  useSocketEvent('order:cancelled', (d) => {
    refreshActiveOrdersAfterTerminal(queryClient, d.orderId, 'cancelled');
  });

  useSocketEvent('order:status', (d) => {
    refreshActiveOrdersAfterTerminal(queryClient, d.orderId, d.status);
  });

  return null;
}
