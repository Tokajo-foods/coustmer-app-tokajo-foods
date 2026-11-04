import type { QueryClient } from '@tanstack/react-query';

import { orderKeys } from '@/lib/order/hooks';
import { isOngoingOrderStatus } from '@/lib/order/ongoing-order';
import { useActiveOrderStore } from '@/store/active-order-store';

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
  void queryClient.invalidateQueries({ queryKey: orderKeys.active() });
}
