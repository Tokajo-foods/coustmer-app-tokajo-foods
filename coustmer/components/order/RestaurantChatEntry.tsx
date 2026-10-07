import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

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
      <MessageCircle color="#FF6A00" size={13} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
