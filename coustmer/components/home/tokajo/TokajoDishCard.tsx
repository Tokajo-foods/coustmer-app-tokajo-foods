import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Heart, Plus, RotateCcw, Star } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { styles } from '@/components/home/tokajo/TokajoDishCard.styles';
import type { HomeTrendingDish } from '@/lib/home/types';

const ORANGE = '#F97316';
const GREEN = '#12833B';
const INK = '#1C1917';

export type DishCardVariant = 'trending' | 'suggested' | 'orderAgain' | 'default';

/** Per-variant image height so rails don't all look identical. */
export const DISH_CARD_WIDTH: Record<DishCardVariant, number> = {
  trending: 187,
  suggested: 182,
  orderAgain: 178,
  default: 168,
};

const IMAGE_HEIGHT: Record<DishCardVariant, number> = {
  trending: 128,
  suggested: 128,
  orderAgain: 128,
  default: 112,
};

type Tag = { label: string; tone: 'orange' | 'light' | 'dark' };

function tagFor(
  variant: DishCardVariant,
  dish: HomeTrendingDish,
  rank?: number
): Tag | null {
  if (variant === 'trending') {
    return { label: rank ? `#${rank} HOT` : 'TRENDING', tone: 'orange' };
  }
  if (variant === 'suggested') {
    return { label: 'RECOMMENDED', tone: 'light' };
  }
  if (variant === 'orderAgain') {
    return { label: 'ORDERED', tone: 'dark' };
  }
  const raw = String(dish.badge ?? '').trim();
  if (!raw) return null;
  return { label: raw, tone: /off|%|deal|save/i.test(raw) ? 'dark' : 'orange' };
}

/** Veg / non-veg dot marker. */
function VegDot({ veg }: { veg?: boolean }) {
  if (veg == null) return null;
  const color = veg ? GREEN : '#D0342C';
  return (
    <View style={[styles.vegBox, { borderColor: color }]}>
      <View style={[styles.vegDot, { backgroundColor: color }]} />
    </View>
  );
}

type Props = {
  dish: HomeTrendingDish;
  variant?: DishCardVariant;
  rank?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onPress: (restaurantId: string) => void;
};

/** Premium dish card with per-section styling (trending / suggested / reorder). */
export const TokajoDishCard = memo(function TokajoDishCard({
  dish,
  variant = 'default',
  rank,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) {
  const rating =
    typeof dish.rating === 'number' && dish.rating > 0 ? dish.rating : null;
  const tag = tagFor(variant, dish, rank);
  const isReorder = variant === 'orderAgain';
  const isSuggested = variant === 'suggested';
  const isTrending = variant === 'trending';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: DISH_CARD_WIDTH[variant] },
        isSuggested && styles.cardSuggested,
        (isTrending || isReorder) && styles.cardTrending,
        isTrending && styles.cardTrendingClip,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(dish.restaurantId)}
    >
      <View style={[styles.imageWrap, { height: IMAGE_HEIGHT[variant] }]}>
        {dish.imageUrl ? (
          <Image
            source={{ uri: dish.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={0}
            recyclingKey={dish.id}
            cachePolicy="memory-disk"
            priority="low"
          />
        ) : (
          <View style={[styles.image, styles.imageEmpty]} />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)']}
          style={styles.imageShade}
          pointerEvents="none"
        />

        {isTrending || isReorder ? (
          <LinearGradient
            colors={['#FF8A1E', '#F4420B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.trendBadge}
          >
            {isReorder ? (
              <RotateCcw color="#FFFFFF" size={11} strokeWidth={2.6} />
            ) : (
              <Flame color="#FFFFFF" fill="#FFE2B0" size={11} strokeWidth={2} />
            )}
            <Text style={styles.trendBadgeText} numberOfLines={1}>
              {isReorder ? 'AGAIN' : rank ? `#${rank}` : 'HOT'}
            </Text>
          </LinearGradient>
        ) : tag ? (
          <View
            style={[
              styles.badge,
              tag.tone === 'orange' && { backgroundColor: ORANGE },
              tag.tone === 'dark' && { backgroundColor: INK },
              tag.tone === 'light' && styles.badgeLight,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                tag.tone === 'light' && styles.badgeTextLight,
              ]}
              numberOfLines={1}
            >
              {tag.label}
            </Text>
          </View>
        ) : null}

        <SmoothPressable
          style={styles.heart}
          pressScale={0.88}
          onPress={() => onToggleFavorite?.(dish.restaurantId)}
          accessibilityLabel="Save"
        >
          <Heart
            color={isFavorite ? '#EF4444' : '#4B4B4B'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            size={15}
            strokeWidth={2.4}
          />
        </SmoothPressable>

        {rating ? (
          <View style={styles.ratingPill}>
            <Star color="#FFFFFF" fill="#FFFFFF" size={10} strokeWidth={2} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.body, isTrending && styles.bodyTrending]}>
        <View style={styles.nameRow}>
          <VegDot veg={dish.isVeg} />
          <Text
            style={[styles.name, isTrending && styles.trendingName]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {dish.name}
          </Text>
        </View>
        <Text
          style={[styles.restaurant, isTrending && styles.trendingRestaurant]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {dish.restaurantName}
        </Text>

        <View style={[styles.priceRow, isTrending && styles.trendingPriceRow]}>
          <Text style={styles.price} numberOfLines={1}>
            ₹{Math.round(dish.price)}
          </Text>
          <SmoothPressable
            style={[
              styles.addBtn,
              isReorder && styles.addBtnRail,
              isTrending && styles.addBtnTrending,
            ]}
            pressScale={0.9}
            onPress={() => onPress(dish.restaurantId)}
            accessibilityLabel={`${isReorder ? 'Reorder' : 'Add'} ${dish.name}`}
          >
            {isReorder ? (
              <RotateCcw color={ORANGE} size={13} strokeWidth={2.6} />
            ) : (
              <Plus color={ORANGE} size={14} strokeWidth={3} />
            )}
            <Text style={styles.addText}>{isReorder ? 'REPEAT' : 'ADD'}</Text>
          </SmoothPressable>
        </View>
      </View>
    </Pressable>
  );
});
