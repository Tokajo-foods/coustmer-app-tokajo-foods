import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { ORANGE, WHITE } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import { useReorder } from '@/lib/order/hooks';
import { canRateOrder } from '@/lib/order/types';

export function TrackingCompletedActions({ orderId, orderStatus }: { orderId: string; orderStatus: string | null }) {
  const router = useRouter();
  const reorder = useReorder(orderId);
  const canRate = canRateOrder(orderStatus ?? undefined);

  const handleReorder = () => {
    Alert.alert('Order again?', 'Add the same items to your cart.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Order again',
        onPress: async () => {
          try {
            const next = await reorder.mutateAsync();
            if (next.mode === 'order' && next.order?.id) {
              router.replace({
                pathname: '/orders/[orderId]/tracking',
                params: { orderId: next.order.id, newOrder: 'true' },
              });
              return;
            }
            Alert.alert('Added to cart', next.message || 'Review your cart to place the order.', [
              { text: 'Go to cart', onPress: () => router.push('/cart' as Href) },
            ]);
          } catch (e) {
            Alert.alert('Reorder failed', e instanceof Error ? e.message : 'Could not reorder');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.completedActions}>
      {canRate ? (
        <Pressable
          style={styles.rateOutlineBtn}
          onPress={() => router.push({ pathname: '/orders/[orderId]/review', params: { orderId } })}
        >
          <Text style={styles.rateOutlineText}>Rate order</Text>
        </Pressable>
      ) : null}
      <Pressable style={styles.reorderSolidBtn} onPress={handleReorder} disabled={reorder.isPending}>
        {reorder.isPending ? <ActivityIndicator color={WHITE} /> : <Text style={styles.reorderSolidText}>Order again</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  completedActions: { marginTop: 12, flexDirection: 'row', gap: 10 },
  rateOutlineBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
  rateOutlineText: { fontFamily: fonts.uiBold, fontSize: 14, color: ORANGE },
  reorderSolidBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderSolidText: { fontFamily: fonts.uiBold, fontSize: 14, color: WHITE },
});
