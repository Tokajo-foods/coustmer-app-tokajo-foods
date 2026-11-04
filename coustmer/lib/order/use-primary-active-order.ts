import { useMemo } from 'react';

import { useActiveOrders } from '@/lib/order/hooks';
import {
  pickPrimaryActiveOrder,
  pickRecentLiveActiveOrder,
} from '@/lib/order/ongoing-order';
import { orderIsTrackable } from '@/lib/order/trackable-order';
import { useAuthStore } from '@/store/auth-store';
import { useActiveOrderStore } from '@/store/active-order-store';

/** Live in-flight order for one-order-at-a-time UX (track pill, checkout guard). */
export function usePrimaryActiveOrder() {
  const loggedIn = Boolean(useAuthStore((s) => s.token));
  const storeOrder = useActiveOrderStore((s) => s.order);
  const query = useActiveOrders({
    enabled: loggedIn,
    refetchInterval: loggedIn ? 20_000 : false,
  });

  const list = useMemo(() => {
    if (!loggedIn) return undefined;
    const fromApi = query.data ?? [];
    if (fromApi.length) return fromApi;
    if (query.isFetching && storeOrder) return [storeOrder];
    return fromApi;
  }, [loggedIn, query.data, query.isFetching, storeOrder]);

  const order = pickPrimaryActiveOrder(list);
  const trackable = order && orderIsTrackable(order) ? order : null;
  const liveOrder = pickRecentLiveActiveOrder(list);

  return {
    order: trackable,
    liveOrder,
    isLoading: loggedIn && query.isLoading && !list?.length,
    refetch: query.refetch,
  };
}
