import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Heart, MapPin, Star } from 'lucide-react-native';
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

function formatDistance(r: Restaurant): string {
  const m = r.distanceMeters;
  if (typeof m === 'number' && m > 0) {
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  }
  if (typeof r.distance === 'number' && r.distance > 0) {
    return `${r.distance.toFixed(1)} km`;
  }
  return '';
}

type Props = {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onPress: (id: string) => void;
};

/** Full-width Zomato-style restaurant card for the vertical feed. */
export function TokajoRestaurantListCard({
  restaurant: r,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) {
  const cover =
    r.imageUrl || r.coverUrl || (r.images?.[0] as string | undefined);
  const eta = r.deliveryTimeLabel || r.deliveryTime;
  const rating = r.avgRating ?? r.rating;
  const count = formatCount(r.totalRatings ?? r.reviewCount);
  const cuisines = (r.cuisines ?? []).slice(0, 4).join(', ');
  const cost = Number(r.costForTwo || r.priceForTwo || 0);
  const distance = formatDistance(r);
  const offer =
    r.offer || (Array.isArray(r.offerBadges) ? r.offerBadges[0] : undefined);

  return (
    <Pressable style={styles.card} onPress={() => onPress(r.id)}>
      <View style={styles.imageWrap}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={styles.image}
            contentFit="cover"
            transition={160}
          />
        ) : (
          <View style={[styles.image, styles.imageEmpty]} />
        )}

        <LinearGradient
          colors={['rgba(0,0,0,0.28)', 'transparent', 'rgba(0,0,0,0.6)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {r.isPromoted ? (
          <View style={styles.promoted}>
            <Text style={styles.promotedText}>PROMOTED</Text>
          </View>
        ) : null}

        <SmoothPressable
          style={styles.heart}
          pressScale={0.9}
          onPress={() => onToggleFavorite?.(r.id)}
          accessibilityLabel="Save restaurant"
        >
          <Heart
            color={isFavorite ? '#EF4444' : '#4B4B4B'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            size={18}
            strokeWidth={2.4}
          />
        </SmoothPressable>

        {eta ? (
          <View style={styles.etaBadge}>
            <Clock color="#FFFFFF" size={12} strokeWidth={2.6} />
            <Text style={styles.etaText}>{eta}</Text>
          </View>
        ) : null}

        {offer ? (
          <View style={styles.offerStrip}>
            <Text style={styles.offerText} numberOfLines={1}>
              {String(offer)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.headRow}>
          <View style={styles.logoWrap}>
            {r.logoUrl ? (
              <Image
                source={{ uri: r.logoUrl }}
                style={styles.logo}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.logo, styles.logoFallback]}>
                <Text style={styles.logoInitial}>
                  {(r.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headText}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={1}>
                {r.name}
              </Text>
              {typeof rating === 'number' && rating > 0 ? (
                <View style={styles.ratingPill}>
                  <Star
                    color="#FFFFFF"
                    fill="#FFFFFF"
                    size={11}
                    strokeWidth={2}
                  />
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
            {cuisines ? (
              <Text style={styles.cuisines} numberOfLines={1}>
                {cuisines}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          {eta ? (
            <View style={styles.metaItem}>
              <Clock color="#6B6B6B" size={13} strokeWidth={2.4} />
              <Text style={styles.metaText}>{eta}</Text>
            </View>
          ) : null}
          {distance ? (
            <>
              <View style={styles.dot} />
              <View style={styles.metaItem}>
                <MapPin color="#6B6B6B" size={13} strokeWidth={2.4} />
                <Text style={styles.metaText}>{distance}</Text>
              </View>
            </>
          ) : null}
          {cost > 0 ? (
            <>
              <View style={styles.dot} />
              <Text style={styles.metaText}>₹{cost} for two</Text>
            </>
          ) : null}
        </View>

        {r.isPureVeg || count ? (
          <View style={styles.chipRow}>
            {r.isPureVeg ? (
              <View style={styles.vegChip}>
                <View style={styles.vegSquare}>
                  <View style={styles.vegDot} />
                </View>
                <Text style={styles.vegChipText}>Pure Veg</Text>
              </View>
            ) : null}
            {count ? (
              <Text style={styles.subMeta}>{count} ratings</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B1220',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  imageWrap: {
    height: 176,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  promoted: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(17,17,17,0.72)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  promotedText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 9.5,
    letterSpacing: 0.6,
  },
  heart: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(17,17,17,0.8)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  etaText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 12,
  },
  offerStrip: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '60%',
  },
  offerText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 12,
  },
  body: {
    padding: 14,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B1220',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  logoFallback: {
    backgroundColor: '#FFF1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: ORANGE,
  },
  headText: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: '#1C1C1C',
    letterSpacing: -0.3,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: GREEN,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ratingText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 12,
  },
  cuisines: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: '#8A8A8A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F1F1',
    marginTop: 12,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.uiSemi,
    fontSize: 12.5,
    color: '#4B4B4B',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C4C4C4',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  vegChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF7EF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  vegSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: GREEN,
  },
  vegChipText: {
    fontFamily: fonts.uiBold,
    fontSize: 10.5,
    color: GREEN,
  },
  subMeta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: '#9A9A9A',
  },
});
