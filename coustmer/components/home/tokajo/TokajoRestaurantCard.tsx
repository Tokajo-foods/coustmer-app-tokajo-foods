import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Heart, Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { SmoothPressable } from '@/components/common/SmoothPressable';
import { fonts } from '@/constants/typography';
import type { Restaurant } from '@/lib/restaurant/types';

const ORANGE = '#F97316';
const GREEN = '#12833B';

function formatCount(n?: number): string {
  if (!n || n <= 0) return '';
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

type Tag = { label: string; tone: 'green' | 'orange' | 'muted' };

function buildTags(r: Restaurant): Tag[] {
  const tags: Tag[] = [];
  const freeDelivery =
    r.freeDeliveryThreshold === 0 ||
    (Array.isArray(r.offerBadges) &&
      r.offerBadges.some((b) => /free\s*deliver/i.test(String(b))));
  if (freeDelivery) tags.push({ label: 'Free Delivery', tone: 'green' });

  const offer =
    r.offer ||
    (Array.isArray(r.offerBadges)
      ? r.offerBadges.find((b) => !/free\s*deliver/i.test(String(b)))
      : undefined);
  if (offer) tags.push({ label: String(offer), tone: 'orange' });

  const cost = Number(r.costForTwo || r.priceForTwo || 0);
  if (cost > 0) tags.push({ label: `₹${cost} for two`, tone: 'muted' });

  if (r.isPureVeg) tags.push({ label: 'Pure Veg', tone: 'green' });

  return tags.slice(0, 3);
}

const TONE: Record<Tag['tone'], { bg: string; fg: string }> = {
  green: { bg: '#EAF7EF', fg: GREEN },
  orange: { bg: '#FFF1E6', fg: ORANGE },
  muted: { bg: '#F3F4F6', fg: '#6B7280' },
};

type Props = {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onPress: (id: string) => void;
};

/** "Restaurants Near You" card: cover, ETA, rating, cuisines, offer tags. */
export function TokajoRestaurantCard({
  restaurant: r,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) {
  const cover = r.imageUrl || r.coverUrl || (r.images?.[0] as string | undefined);
  const eta = r.deliveryTimeLabel || r.deliveryTime;
  const rating = r.avgRating ?? r.rating;
  const count = formatCount(r.totalRatings ?? r.reviewCount);
  const cuisines = (r.cuisines ?? []).slice(0, 3).join(' • ');
  const tags = buildTags(r);

  return (
    <Pressable style={styles.card} onPress={() => onPress(r.id)}>
      <View style={styles.imageWrap}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.image, styles.imageEmpty]} />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.imageShade}
          pointerEvents="none"
        />

        {eta ? (
          <View style={styles.etaBadge}>
            <Clock color="#FFFFFF" size={12} strokeWidth={2.6} />
            <Text style={styles.etaText}>{eta}</Text>
          </View>
        ) : null}

        {typeof rating === 'number' && rating > 0 ? (
          <View style={styles.ratingPill}>
            <Star color="#FFFFFF" fill="#FFFFFF" size={11} strokeWidth={2} />
            <Text style={styles.ratingPillText}>
              {rating.toFixed(1)}
              {count ? ` (${count})` : ''}
            </Text>
          </View>
        ) : null}

        <SmoothPressable
          style={styles.heart}
          pressScale={0.9}
          onPress={() => onToggleFavorite?.(r.id)}
          accessibilityLabel="Save restaurant"
        >
          <Heart
            color={isFavorite ? '#EF4444' : '#8A8A8A'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            size={16}
            strokeWidth={2.4}
          />
        </SmoothPressable>

        {r.logoUrl ? (
          <Image source={{ uri: r.logoUrl }} style={styles.logo} contentFit="cover" />
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {r.name}
        </Text>

        {cuisines ? (
          <Text style={styles.cuisines} numberOfLines={1}>
            {cuisines}
          </Text>
        ) : null}

        {tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.map((t, i) => (
              <View
                key={`${t.label}-${i}`}
                style={[styles.tag, { backgroundColor: TONE[t.tone].bg }]}
              >
                <Text style={[styles.tagText, { color: TONE[t.tone].fg }]}>
                  {t.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 264,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B1220',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  imageWrap: {
    height: 138,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageEmpty: {
    backgroundColor: '#EFEFEF',
  },
  imageShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  ratingPill: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: GREEN,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ratingPillText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 11,
  },
  etaBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(17,17,17,0.78)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  etaText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 11,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  body: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#1C1C1C',
    letterSpacing: -0.2,
  },
  cuisines: {
    fontFamily: fonts.ui,
    fontSize: 12.5,
    color: '#8A8A8A',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: fonts.uiBold,
    fontSize: 10.5,
  },
});
