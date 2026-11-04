import type { QueryClient } from '@tanstack/react-query';

import { orderKeys } from '@/lib/order/hooks';
import { isOngoingOrderStatus } from '@/lib/order/ongoing-order';
import { useActiveOrderStore } from '@/store/active-order-store';

import type { Order } from '@/lib/order/types';

/** Drop cached active order when the trip ends (cancel, deliver, etc.). */
export function refreshActiveOrdersAfterTerminal(
  queryClient: QueryClient,
  orderId?: string,
  status?: string,
): void {
  if (status && isOngoingOrderStatus(status)) return;
  const stored = useActiveOrderStore.getState().order;
  if (!orderId || !stored || stored.id === orderId) {
    useActiveOrderStore.getState().setOrder(null);
  }
  queryClient.setQueryData<Order[]>(orderKeys.active(), (current) => {
    if (!current?.length) return [];
    return current.filter(
      (o) => (orderId ? o.id !== orderId : true) && isOngoingOrderStatus(o.status),
    );
  });
  void queryClient.invalidateQueries({ queryKey: orderKeys.active() });
}
