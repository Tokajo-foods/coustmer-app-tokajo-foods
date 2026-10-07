import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { fonts } from '@/constants/typography';

type Props = {
  orderId: string;
  restaurantName: string;
};

export function RestaurantChatEntry({ orderId, restaurantName }: Props) {
  const router = useRouter();
  const name = restaurantName.trim() || 'Restaurant';
  return (
    <Pressable
      accessibilityLabel={`Message ${name}`}
      hitSlop={10}
      style={styles.btn}
      onPress={() =>
        router.push({
          pathname: '/orders/[orderId]/restaurant-chat',
          params: { orderId, restaurantName: name },
        })
      }
    >
      <MessageCircle color="#FF6A00" size={14} strokeWidth={2.4} />
      <Text style={styles.label}>Chat</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFF1E8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: '#FF6A00',
  },
});
