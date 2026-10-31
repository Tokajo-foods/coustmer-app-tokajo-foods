import { useActiveOrders } from '@/lib/order/hooks';
import { pickPrimaryActiveOrder } from '@/lib/order/ongoing-order';
import { useAuthStore } from '@/store/auth-store';

/** Live in-flight order for one-order-at-a-time UX (track pill, checkout guard). */
export function usePrimaryActiveOrder() {
  const loggedIn = Boolean(useAuthStore((s) => s.token));
  const query = useActiveOrders({
    enabled: loggedIn,
    refetchInterval: loggedIn ? 20_000 : false,
  });
  const order = loggedIn ? pickPrimaryActiveOrder(query.data) : null;
  return {
    order,
    isLoading: loggedIn && query.isLoading,
    refetch: query.refetch,
  };
}
