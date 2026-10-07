import { useRouter } from 'expo-router';
import { ChevronRight, MessageCircle } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
      style={styles.row}
      onPress={() =>
        router.push({
          pathname: '/orders/[orderId]/restaurant-chat',
          params: { orderId, restaurantName: name },
        })
      }
    >
      <View style={styles.icon}>
        <MessageCircle color="#FF6A00" size={18} strokeWidth={2.4} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>Message {name}</Text>
        <Text style={styles.sub}>Chat about this order</Text>
      </View>
      <ChevronRight color="#FF6A00" size={16} strokeWidth={2.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0E6DE',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  title: { fontFamily: fonts.uiBold, fontSize: 15, color: '#111827' },
  sub: { marginTop: 2, fontFamily: fonts.ui, fontSize: 12, color: '#6B7280' },
});
