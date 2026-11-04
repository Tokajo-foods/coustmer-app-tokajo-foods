import { useActiveOrders } from '@/lib/order/hooks';
import { pickPrimaryActiveOrder } from '@/lib/order/ongoing-order';
import { orderIsTrackable } from '@/lib/order/trackable-order';
import { useAuthStore } from '@/store/auth-store';
import { useIsRestoring } from '@tanstack/react-query-persist-client';

/** Live in-flight order for one-order-at-a-time UX (track pill, checkout guard). */
export function usePrimaryActiveOrder() {
  const loggedIn = Boolean(useAuthStore((s) => s.token));
  const isRestoring = useIsRestoring();
  const query = useActiveOrders({
    enabled: loggedIn,
    refetchInterval: loggedIn ? 20_000 : false,
  });
  const canUseCache = loggedIn && !isRestoring && query.isFetchedAfterMount;
  const order = canUseCache ? pickPrimaryActiveOrder(query.data) : null;
  const trackable = order && orderIsTrackable(order) ? order : null;
  return {
    order: trackable,
    isLoading: loggedIn && (query.isLoading || isRestoring),
    refetch: query.refetch,
  };
}
