import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pressable } from '@/components/common/Pressable';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { ErrorView, LoadingView } from '@/components/common/StateViews';
import { RateOrderForm } from '@/components/review/form/RateOrderForm';
import { StarRatingInput } from '@/components/review/StarRatingInput';
import { fonts } from '@/constants/typography';
import { getApiErrorMessage } from '@/lib/errors';
import { useOrder } from '@/lib/order/hooks';
import { canRateOrder } from '@/lib/order/types';
import { useOrderReview, useSubmitOrderReview, useUpdateRestaurantReview } from '@/lib/review/hooks';

/** Matches review-service EDIT_WINDOW_MS. */
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

function goBackSafe(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) router.back();
  else router.replace('/orders');
}

export function SubmitReviewScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const id = String(orderId ?? '');

  const order = useOrder(id);
  const rateable = canRateOrder(order.data?.status);
  const existing = useOrderReview(id, { enabled: Boolean(id) && rateable });
  const restaurantId = String(order.data?.restaurantId ?? '');
  const review = existing.data ?? null;
  const submit = useSubmitOrderReview(id);
  const update = useUpdateRestaurantReview(restaurantId, String(review?.id ?? ''));

  if (order.isLoading || (rateable && existing.isLoading)) return <LoadingView label="Loading…" />;

  if (order.isError || !order.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Rate order" />
        <ErrorView
          message={order.error instanceof Error ? order.error.message : 'Order not found'}
          onRetry={() => order.refetch()}
        />
      </SafeAreaView>
    );
  }

  const restaurantName = order.data.restaurantName || 'the restaurant';
  const createdAt = review?.createdAt ? Date.parse(review.createdAt) : NaN;
  const canEdit = Boolean(review) && Number.isFinite(createdAt) && Date.now() - createdAt < EDIT_WINDOW_MS;

  let body: ReactNode;
  if (!rateable) {
    body = (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>You can rate after delivery</Text>
        <Text style={styles.cardBody}>The rating form unlocks once your order is delivered.</Text>
      </View>
    );
  } else if (review && !canEdit) {
    body = (
      <View style={styles.card}>
        <CheckCircle2 color="#16A34A" size={36} strokeWidth={1.8} />
        <Text style={styles.cardTitle}>You rated {restaurantName}</Text>
        <StarRatingInput value={review.rating} readonly size={26} />
        {review.comment ? <Text style={styles.comment}>“{review.comment}”</Text> : null}
      </View>
    );
  } else if (review) {
    body = (
      <RateOrderForm
        restaurantName={restaurantName}
        initialRating={review.rating}
        initialComment={review.comment ?? ''}
        submitLabel="Update rating"
        submitting={update.isPending}
        error={update.isError ? getApiErrorMessage(update.error) : null}
        onSubmit={(rating, comment) =>
          update.mutate({ rating, comment: comment || undefined, orderId: id }, { onSuccess: () => goBackSafe(router) })
        }
      />
    );
  } else {
    body = (
      <RateOrderForm
        restaurantName={restaurantName}
        submitting={submit.isPending}
        error={submit.isError ? getApiErrorMessage(submit.error) : null}
        onSubmit={(rating, comment) =>
          submit.mutate({ restaurantId, rating, comment: comment || undefined }, { onSuccess: () => goBackSafe(router) })
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={review ? 'Your rating' : 'Rate your order'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
          {review && canEdit ? (
            <Text style={styles.hint}>You can change your rating for 24 hours after posting it.</Text>
          ) : null}
          {!rateable || (review && !canEdit) ? (
            <Pressable style={styles.back} onPress={() => goBackSafe(router)}>
              <Text style={styles.backText}>Back to order</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  card: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  cardTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: '#18181B', textAlign: 'center' },
  cardBody: { fontFamily: fonts.ui, fontSize: 14, color: '#71717A', textAlign: 'center' },
  comment: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 20, color: '#3F3F46', textAlign: 'center', marginTop: 4 },
  hint: { fontFamily: fonts.ui, fontSize: 12, color: '#A1A1AA', textAlign: 'center', marginTop: 16 },
  back: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
  },
  backText: { fontFamily: fonts.uiBold, fontSize: 14, color: '#F97316' },
});
