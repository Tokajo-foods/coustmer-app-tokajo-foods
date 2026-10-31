import { useLocalSearchParams } from 'expo-router';
import { Bike } from 'lucide-react-native';
import { View } from 'react-native';

import { ChatLogoAvatar, OrderThreadChatLayout } from '@/components/order/chat/OrderThreadChatLayout';
import { useThreadChat } from '@/components/order/chat/use-thread-chat';
import { useOrderTracking } from '@/lib/delivery/hooks';

export function PartnerChatScreen() {
  const { orderId, partnerName } = useLocalSearchParams<{ orderId: string; partnerName?: string }>();
  const id = String(orderId ?? '');
  const tracking = useOrderTracking(id, { enabled: Boolean(id) });
  const partner = tracking.data?.partner;
  const title =
    String(partnerName ?? '').trim() ||
    partner?.name?.trim() ||
    'Delivery partner';
  const chat = useThreadChat(id, 'partner');

  return (
    <OrderThreadChatLayout
      title={title}
      presence="Delivery partner"
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
