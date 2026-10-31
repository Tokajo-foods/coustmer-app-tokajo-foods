import { router, type Router } from 'expo-router';
import { Alert } from 'react-native';

import { ongoingOrderMessage } from '@/lib/order/ongoing-order';
import type { Order } from '@/lib/order/types';
import { useActiveOrderStore } from '@/store/active-order-store';

export function alertOngoingOrderBlocks(order: Order, nav: Router = router): void {
  Alert.alert('Order in progress', ongoingOrderMessage(order), [
    {
      text: 'Track order',
      onPress: () =>
        nav.push({
          pathname: '/orders/[orderId]/tracking',
          params: { orderId: order.id },
        }),
    },
    { text: 'OK', style: 'cancel' },
  ]);
}

/** Returns true when a new cart / checkout action must be blocked. */
export function blockIfOngoingOrder(nav: Router = router): boolean {
  const order = useActiveOrderStore.getState().order;
  if (!order) return false;
  alertOngoingOrderBlocks(order, nav);
  return true;
}
