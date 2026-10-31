import type { Router } from 'expo-router';
import { Alert } from 'react-native';

import { ongoingOrderMessage } from '@/lib/order/ongoing-order';
import type { Order } from '@/lib/order/types';

export function alertOngoingOrderBlocks(order: Order, router: Router): void {
  Alert.alert('Order in progress', ongoingOrderMessage(order), [
    {
      text: 'Track order',
      onPress: () =>
        router.push({
          pathname: '/orders/[orderId]/tracking',
          params: { orderId: order.id },
        }),
    },
    { text: 'OK', style: 'cancel' },
  ]);
}
