import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { RestaurantReview } from '@/lib/review/types';

const CHIP_COLORS: Record<number, string> = { 5: '#16A34A', 4: '#16A34A', 3: '#CA8A04', 2: '#EA580C', 1: '#DC2626' };

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const ReviewCard = memo(function ReviewCard({ review }: { review: RestaurantReview }) {
  const name = review.userName?.trim() || 'Customer';
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.who}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: CHIP_COLORS[review.rating] ?? '#16A34A' }]}>
          <Text style={styles.chipText}>{review.rating}</Text>
          <Star color="#FFFFFF" fill="#FFFFFF" size={10} />
        </View>
      </View>
      {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}
      {review.photos?.length ? (
        <View style={styles.photos}>
          {review.photos.slice(0, 3).map((uri, i) => (
            <Image key={`${uri}-${i}`} source={{ uri }} style={styles.photo} contentFit="cover" />
          ))}
        </View>
      ) : null}
      {review.reply?.text ? (
        <View style={styles.reply}>
          <Text style={styles.replyLabel}>Reply from the restaurant</Text>
          <Text style={styles.replyText}>{review.reply.text}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E4E4E7' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.uiBold, fontSize: 15, color: '#EA580C' },
  who: { flex: 1 },
  name: { fontFamily: fonts.uiBold, fontSize: 14, color: '#18181B' },
  date: { fontFamily: fonts.ui, fontSize: 12, color: '#A1A1AA', marginTop: 1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: { fontFamily: fonts.uiBold, fontSize: 12, color: '#FFFFFF' },
  comment: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 21, color: '#3F3F46', marginTop: 10 },
  photos: { flexDirection: 'row', gap: 8, marginTop: 10 },
  photo: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#F4F4F5' },
  reply: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 3,
    borderLeftColor: '#F97316',
  },
  replyLabel: { fontFamily: fonts.uiBold, fontSize: 12, color: '#18181B', marginBottom: 4 },
  replyText: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 19, color: '#52525B' },
});
