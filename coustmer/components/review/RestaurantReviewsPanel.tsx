import { MessageSquareText, Star } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';
import { useRestaurantReviewStats, useRestaurantReviews } from '@/lib/review/hooks';

import { RatingSummaryCard } from './panel/RatingSummaryCard';
import { ReviewCard } from './panel/ReviewCard';

const REVIEW_LIMIT = 20;

function Message({ icon, title, body, onRetry }: {
  icon: 'empty' | 'error';
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  const Icon = icon === 'empty' ? Star : MessageSquareText;
  return (
    <View style={styles.center}>
      <Icon color="#D4D4D8" size={36} strokeWidth={1.6} />
      <Text style={styles.centerTitle}>{title}</Text>
      <Text style={styles.centerBody}>{body}</Text>
      {onRetry ? (
        <Pressable style={styles.retry} onPress={onRetry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Restaurant page "Reviews" tab: rating summary + star distribution + written reviews. */
export function RestaurantReviewsPanel({ restaurantId }: { restaurantId: string }) {
  const stats = useRestaurantReviewStats(restaurantId);
  const reviews = useRestaurantReviews(restaurantId, { page: 1, limit: REVIEW_LIMIT, withComment: true });

  if (stats.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#F97316" />
      </View>
    );
  }

  if (stats.isError || !stats.data) {
    return (
      <Message
        icon="error"
        title="Couldn't load ratings"
        body={stats.error instanceof Error ? stats.error.message : 'Please try again.'}
        onRetry={() => {
          void stats.refetch();
          void reviews.refetch();
        }}
      />
    );
  }

  if (stats.data.total === 0) {
    return (
      <Message
        icon="empty"
        title="No ratings for this restaurant yet"
        body="Order from here and be the first to rate it."
      />
    );
  }

  const list = reviews.data?.reviews ?? [];
  const written = stats.data.writtenReviews;

  return (
    <View style={styles.wrap}>
      <RatingSummaryCard stats={stats.data} />

      <Text style={styles.listTitle}>
        Reviews{written ? <Text style={styles.listCount}>{`  ${written.toLocaleString('en-IN')}`}</Text> : null}
      </Text>

      {reviews.isLoading ? (
        <ActivityIndicator color="#F97316" style={styles.listSpinner} />
      ) : reviews.isError ? (
        <Message
          icon="error"
          title="Couldn't load reviews"
          body={reviews.error instanceof Error ? reviews.error.message : 'Please try again.'}
          onRetry={() => void reviews.refetch()}
        />
      ) : list.length === 0 ? (
        <Text style={styles.noWritten}>
          People have rated this restaurant but nobody has written a review yet.
        </Text>
      ) : (
        list.map((review) => <ReviewCard key={review.id} review={review} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  listTitle: { fontFamily: fonts.displayBold, fontSize: 17, color: '#18181B', marginTop: 24, marginBottom: 2 },
  listCount: { fontFamily: fonts.uiMedium, fontSize: 14, color: '#A1A1AA' },
  listSpinner: { marginTop: 20 },
  noWritten: { fontFamily: fonts.ui, fontSize: 14, color: '#71717A', marginTop: 10, lineHeight: 20 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 8 },
  centerTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: '#18181B', textAlign: 'center', marginTop: 6 },
  centerBody: { fontFamily: fonts.ui, fontSize: 14, color: '#71717A', textAlign: 'center', lineHeight: 20 },
  retry: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: '#F97316' },
  retryText: { fontFamily: fonts.uiBold, fontSize: 13, color: '#FFFFFF' },
});
