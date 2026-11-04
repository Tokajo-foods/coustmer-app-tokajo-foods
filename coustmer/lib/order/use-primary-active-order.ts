import { useEffect, useState } from 'react';

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
  /** Avoid showing track from persisted cache until fresh GET /orders/active completes. */
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      setSessionReady(false);
      return;
    }
    let cancelled = false;
    setSessionReady(false);
    void query.refetch().finally(() => {
      if (!cancelled) setSessionReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [loggedIn, query.refetch]);

  const list =
    loggedIn && sessionReady
      ? query.data
      : loggedIn && storeOrder
        ? [storeOrder]
        : undefined;

  const order = pickPrimaryActiveOrder(list);
  const trackable = order && orderIsTrackable(order) ? order : null;
  const liveOrder = pickRecentLiveActiveOrder(list);

  return {
    order: trackable,
    liveOrder,
    isLoading: loggedIn && (!sessionReady || query.isLoading),
    refetch: query.refetch,
  };
}
