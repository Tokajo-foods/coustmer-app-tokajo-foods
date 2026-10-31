import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { formatInr } from '@/lib/format/money';
import type { useOrders } from '@/lib/order/hooks';

import { hubStyles as s } from './support-hub-styles';

type Order = NonNullable<ReturnType<typeof useOrders>['data']>['orders'][number];

/** Latest order shortcut — opens a new ticket pre-linked to it. */
export function RecentOrderCard({ order }: { order: Order }) {
  const router = useRouter();
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>RECENT ORDER</Text>
      <Pressable
        style={s.orderCard}
        onPress={() => router.push({ pathname: '/support/new', params: { orderId: order.id } })}
      >
        <View style={s.orderTop}>
          <View>
            <Text style={s.restaurantName}>{order.restaurantName}</Text>
            <Text style={s.orderMeta}>
              {order.deliveryAddress?.label || 'Home'} | {formatInr(order.total)}
            </Text>
          </View>
          {order.status === 'delivered' ? (
            <View style={s.statusWrap}>
              <Text style={s.statusText}>Delivered</Text>
              <CheckCircle2 color="#16A34A" size={14} />
            </View>
          ) : null}
        </View>
        <View style={s.divider} />
        <View style={s.orderBottom}>
          <Text style={s.itemsText} numberOfLines={1}>
            {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
          </Text>
          <ChevronRight color="#9CA3AF" size={18} />
        </View>
      </Pressable>
    </View>
  );
}
