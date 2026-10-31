import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bike } from 'lucide-react-native';
import { View } from 'react-native';

import { ErrorView, LoadingView } from '@/components/common/StateViews';
import { ChatLogoAvatar, OrderThreadChatLayout } from '@/components/order/chat/OrderThreadChatLayout';
import { useThreadChat } from '@/components/order/chat/use-thread-chat';
import { useOrderTracking } from '@/lib/delivery/hooks';
import { useOrder } from '@/lib/order/hooks';

export function PartnerChatScreen() {
  const router = useRouter();
  const { orderId, partnerName } = useLocalSearchParams<{ orderId: string; partnerName?: string }>();
  const id = String(orderId ?? '');
  const order = useOrder(id);
  const tracking = useOrderTracking(id, { enabled: Boolean(id) });
  const partner = tracking.data?.partner;
  const title =
    String(partnerName ?? '').trim() ||
    partner?.name?.trim() ||
    'Delivery partner';
  const chat = useThreadChat(id, 'partner');

  if (!id) {
    return <ErrorView message="Order not found" onRetry={() => router.back()} />;
  }

  if (order.isLoading && !order.data) {
    return <LoadingView label="Loading chat…" />;
  }

  const status = order.data?.status?.toLowerCase().replace(/[\s-]+/g, '_');
  const chatClosed = status && ['cancelled', 'canceled', 'rejected', 'failed', 'payment_failed'].includes(status);

  if (chatClosed) {
    return (
      <ErrorView
        message="This chat is closed for this order."
        onRetry={() => router.replace({ pathname: '/orders/[orderId]', params: { orderId: id } })}
      />
    );
  }

  return (
    <OrderThreadChatLayout
      title={title}
      presence={partner ? 'Delivery partner' : 'Assigning partner…'}
      avatar={
        partner?.imageUrl ? (
          <ChatLogoAvatar uri={partner.imageUrl} fallback={title} />
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Bike color="#FFFFFF" size={20} strokeWidth={2.4} />
          </View>
        )
      }
      messages={chat.messages}
      loading={chat.loading}
      sending={chat.sending}
      error={chat.error}
      typing={chat.typing}
      onSend={chat.send}
    />
  );
}
