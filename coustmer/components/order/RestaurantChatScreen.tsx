import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { ChatLogoAvatar, OrderThreadChatLayout } from '@/components/order/chat/OrderThreadChatLayout';
import { useThreadChat } from '@/components/order/chat/use-thread-chat';
import { useOrder } from '@/lib/order/hooks';
import { restaurantApi } from '@/lib/restaurant/api';

export function RestaurantChatScreen() {
  const { orderId, restaurantName } = useLocalSearchParams<{
    orderId: string;
    restaurantName?: string;
  }>();
  const id = String(orderId ?? '');
  const order = useOrder(id);
  const restaurantId = order.data?.restaurantId;
  const restaurant = useQuery({
    queryKey: ['restaurant-chat-logo', restaurantId],
    queryFn: () => restaurantApi.getRestaurant(String(restaurantId)),
    enabled: Boolean(restaurantId),
  });
  const title =
    String(restaurantName ?? '').trim() ||
    order.data?.restaurantName?.trim() ||
    restaurant.data?.name?.trim() ||
    'Restaurant';
  const chat = useThreadChat(id, 'restaurant');

  return (
    <OrderThreadChatLayout
      title={title}
      presence="Restaurant"
      avatar={<ChatLogoAvatar uri={restaurant.data?.logoUrl} fallback={title} />}
      messages={chat.messages}
      loading={chat.loading}
      sending={chat.sending}
      error={chat.error}
      typing={chat.typing}
      onSend={chat.send}
    />
  );
}
