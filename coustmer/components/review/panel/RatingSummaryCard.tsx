import { Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { StarRatingInput } from '@/components/review/StarRatingInput';
import { fonts } from '@/constants/typography';
import type { ReviewStats } from '@/lib/review/types';

const BAR_COLORS: Record<number, string> = {
  5: '#16A34A',
  4: '#65A30D',
  3: '#EAB308',
  2: '#F97316',
  1: '#DC2626',
};

function plural(n: number, word: string): string {
  return `${n.toLocaleString('en-IN')} ${word}${n === 1 ? '' : 's'}`;
}

/** Average out of 5, how many rated vs wrote a review, and how many gave each star. */
export function RatingSummaryCard({ stats }: { stats: ReviewStats }) {
  const { average, total, writtenReviews, distribution } = stats;
  return (
    <View style={styles.card}>
      <View style={styles.scoreCol}>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{average.toFixed(1)}</Text>
          <Star color="#16A34A" fill="#16A34A" size={20} />
        </View>
        <Text style={styles.outOf}>out of 5</Text>
        <StarRatingInput value={average} readonly size={14} />
        <Text style={styles.counts}>{plural(total, 'rating')}</Text>
        <Text style={styles.counts}>{plural(writtenReviews, 'review')}</Text>
      </View>

      <View style={styles.bars}>
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = distribution[star] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <View key={star} style={styles.barRow} accessibilityLabel={`${star} star: ${count} people`}>
              <Text style={styles.barStar}>{star}</Text>
              <Star color="#A1A1AA" fill="#A1A1AA" size={10} />
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: BAR_COLORS[star] }]} />
              </View>
              <Text style={styles.barCount}>{count.toLocaleString('en-IN')}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEF0',
    backgroundColor: '#FFFFFF',
  },
  scoreCol: { width: 104, alignItems: 'center', justifyContent: 'center', gap: 3 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  score: { fontFamily: fonts.displayBold, fontSize: 34, color: '#18181B' },
  outOf: { fontFamily: fonts.ui, fontSize: 12, color: '#71717A', marginBottom: 4 },
  counts: { fontFamily: fonts.uiMedium, fontSize: 12, color: '#52525B', marginTop: 2 },
  bars: { flex: 1, justifyContent: 'center', gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  barStar: { width: 10, fontFamily: fonts.uiBold, fontSize: 12, color: '#3F3F46', textAlign: 'right' },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F1F3',
    overflow: 'hidden',
    marginLeft: 4,
  },
  fill: { height: '100%', borderRadius: 4 },
  barCount: { width: 34, fontFamily: fonts.uiMedium, fontSize: 12, color: '#52525B', textAlign: 'right' },
});
