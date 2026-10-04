import { Image } from 'expo-image';
import { Clock, Heart, MapPin, Star } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { styles } from '@/components/home/tokajo/TokajoRestaurantListCard.styles';
import type { Restaurant } from '@/lib/restaurant/types';

const ORANGE = '#F97316';

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
  /** Hairline above this card, so it reads as the next card after the one above. */
  divided?: boolean;
  onToggleFavorite?: (id: string) => void;
  onPress: (id: string) => void;
};

/** Full-width modern restaurant card for the home feed. */
export const TokajoRestaurantListCard = memo(function TokajoRestaurantListCard({
  restaurant: r,
  isFavorite,
  divided,
  onToggleFavorite,
  onPress,
}: Props) {
  const cover =
    r.imageUrl || r.coverUrl || (r.images?.[0] as string | undefined);
  const eta = r.deliveryTimeLabel || r.deliveryTime;
  const rating = r.avgRating ?? r.rating;
  const count = formatCount(r.totalRatings ?? r.reviewCount);
  const cuisines = (r.cuisines ?? []).slice(0, 3).join(' • ');
  const cost = Number(r.costForTwo || r.priceForTwo || 0);
  const distance = formatDistance(r);
  const offer =
    r.offer || (Array.isArray(r.offerBadges) ? r.offerBadges[0] : undefined);

  return (
    <View>
      {divided ? <View style={styles.separator} /> : null}
      <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(r.id)}
    >
      <View style={styles.imageWrap}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={styles.image}
            contentFit="cover"
            transition={0}
            recyclingKey={r.id}
            cachePolicy="memory-disk"
            priority="normal"
          />
        ) : (
          <View style={[styles.image, styles.imageEmpty]} />
        )}

        <View
          style={[styles.imageShade, !offer && styles.imageShadeLight]}
          pointerEvents="none"
        />

        {r.isPromoted ? (
          <View style={styles.promoted}>
            <Text style={styles.promotedText}>Ad</Text>
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
            size={17}
            strokeWidth={2.4}
          />
        </SmoothPressable>

        <View style={styles.logoBadge} pointerEvents="none">
          {r.logoUrl ? (
            <Image
              source={{ uri: r.logoUrl }}
              style={styles.logo}
              contentFit="cover"
              recyclingKey={`${r.id}-logo`}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={styles.logoInitial}>
                {(r.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {offer ? (
          <View style={styles.offerChip} pointerEvents="none">
            <Text style={styles.offerChipText} numberOfLines={1}>
              {String(offer)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {r.name}
          </Text>
          {typeof rating === 'number' && rating > 0 ? (
            <View style={styles.ratingWrap}>
              <View style={styles.ratingPill}>
                <Star
                  color="#FFFFFF"
                  fill="#FFFFFF"
                  size={11}
                  strokeWidth={2}
                />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
              {count ? (
                <Text style={styles.ratingCount}>({count})</Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {cuisines ? (
          <Text style={styles.cuisines} numberOfLines={1}>
            {cuisines}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          {eta ? (
            <View style={styles.metaItem}>
              <Clock color={ORANGE} size={13} strokeWidth={2.6} />
              <Text style={styles.metaText}>{eta}</Text>
            </View>
          ) : null}
          {distance ? (
            <View style={styles.metaItem}>
              {eta ? <View style={styles.dot} /> : null}
              <MapPin color={ORANGE} size={13} strokeWidth={2.6} />
              <Text style={styles.metaText}>{distance}</Text>
            </View>
          ) : null}
          {cost > 0 ? (
            <View style={styles.metaItem}>
              {eta || distance ? <View style={styles.dot} /> : null}
              <Text style={styles.metaText}>₹{cost} for two</Text>
            </View>
          ) : null}

          {r.isPureVeg ? (
            <View style={styles.vegChip}>
              <View style={styles.vegSquare}>
                <View style={styles.vegDot} />
              </View>
              <Text style={styles.vegChipText}>Veg</Text>
            </View>
          ) : null}
        </View>
      </View>
      </Pressable>
    </View>
  );
});
