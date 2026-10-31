import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';
import { formatInr } from '@/lib/format/money';
import {
  useCancelOrder,
  useCancelScheduledOrder,
  useCancellationQuote,
} from '@/lib/order/hooks';
import { canCancelOrder, isScheduledOrder, type Order } from '@/lib/order/types';

type Props = { order: Order };

export function TrackingCancelBar({ order }: Props) {
  const scheduled = isScheduledOrder(order);
  const allowed = canCancelOrder(order.status) || scheduled;
  const cancelOrder = useCancelOrder(order.id);
  const cancelScheduled = useCancelScheduledOrder(order.id);
  const quote = useCancellationQuote(order.id, false);
  const [busy, setBusy] = useState(false);

  if (!allowed) return null;

  const run = async () => {
    let message = scheduled
      ? 'This removes the future order.'
      : 'You can cancel only before the restaurant starts preparing.';
    if (!scheduled) {
      try {
        const next = await quote.refetch();
        if (next.data?.message) message = next.data.message;
        else if (next.data && next.data.refundable > 0) {
          message = `You'll receive a refund of ${formatInr(next.data.refundable)}.`;
        }
      } catch {
        // still offer cancel
      }
    }
    Alert.alert(scheduled ? 'Cancel scheduled order?' : 'Cancel this order?', message, [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            if (scheduled) await cancelScheduled.mutateAsync();
            else await cancelOrder.mutateAsync({ reason: 'Cancelled by customer' });
            Alert.alert('Cancelled', 'Your order was cancelled.');
          } catch (e) {
            Alert.alert('Could not cancel', e instanceof Error ? e.message : 'Please try again');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const pending = busy || cancelOrder.isPending || cancelScheduled.isPending;

  return (
    <Pressable style={styles.btn} onPress={() => void run()} disabled={pending}>
      {pending ? (
        <ActivityIndicator color="#DC2626" />
      ) : (
        <Text style={styles.text}>{scheduled ? 'Cancel schedule' : 'Cancel order'}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: 16,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: fonts.uiBold, fontSize: 14, color: '#DC2626' },
});
