import { useEffect } from 'react';

import { usePrimaryActiveOrder } from '@/lib/order/use-primary-active-order';
import { useActiveOrderStore } from '@/store/active-order-store';

/** Keeps `useActiveOrderStore` aligned with GET /orders/active. */
export function ActiveOrderSync() {
  const { order } = usePrimaryActiveOrder();
  const setOrder = useActiveOrderStore((s) => s.setOrder);

  useEffect(() => {
    setOrder(order);
  }, [order, setOrder]);

  return null;
}
