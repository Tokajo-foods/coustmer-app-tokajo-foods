import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Heart, Plus, RotateCcw, Star } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { fonts } from '@/constants/typography';
import type { HomeTrendingDish } from '@/lib/home/types';

const ORANGE = '#F97316';
const GREEN = '#12833B';
const INK = '#1C1917';

export type DishCardVariant = 'trending' | 'suggested' | 'orderAgain' | 'default';

/** Per-variant image height so rails don't all look identical. */
export const DISH_CARD_WIDTH: Record<DishCardVariant, number> = {
  trending: 178,
  suggested: 182,
  orderAgain: 158,
  default: 168,
};

const IMAGE_HEIGHT: Record<DishCardVariant, number> = {
  trending: 128,
  suggested: 128,
  orderAgain: 102,
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
        isTrending && styles.cardTrending,
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

        {isTrending ? (
          <LinearGradient
            colors={['#FF8A1E', '#F4420B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.trendBadge}
          >
            <Flame color="#FFFFFF" fill="#FFE2B0" size={11} strokeWidth={2} />
            <Text style={styles.trendBadgeText} numberOfLines={1}>
              {rank ? `#${rank}` : 'HOT'}
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

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <VegDot veg={dish.isVeg} />
          <Text style={styles.name} numberOfLines={1}>
            {dish.name}
          </Text>
        </View>
        <Text style={styles.restaurant} numberOfLines={1}>
          {dish.restaurantName}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price} numberOfLines={1}>
            ₹{Math.round(dish.price)}
          </Text>
          <SmoothPressable
            style={[styles.addBtn, isReorder && styles.reorderBtn]}
            pressScale={0.9}
            onPress={() => onPress(dish.restaurantId)}
            accessibilityLabel={`${isReorder ? 'Reorder' : 'Add'} ${dish.name}`}
          >
            {isReorder ? (
              <RotateCcw color="#FFFFFF" size={13} strokeWidth={2.6} />
            ) : (
              <Plus color={ORANGE} size={14} strokeWidth={3} />
            )}
            <Text
              style={[styles.addText, isReorder && styles.addTextReorder]}
            >
              {isReorder ? 'REPEAT' : 'ADD'}
            </Text>
          </SmoothPressable>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B1220',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.94,
  },
  cardSuggested: {
    borderWidth: 1,
    borderColor: '#FFE0C2',
  },
  cardTrending: {
    shadowColor: '#C2410C',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
  },
  trendBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    shadowColor: '#C2410C',
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  trendBadgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  imageWrap: {
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
    height: 48,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: ORANGE,
  },
  badgeLight: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  badgeTextLight: {
    color: ORANGE,
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingPill: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  ratingText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 10.5,
  },
  body: {
    padding: 11,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: '#1C1C1C',
  },
  restaurant: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: '#9A9A9A',
  },
  priceRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  price: {
    flexShrink: 1,
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#1C1C1C',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7F0',
    borderWidth: 1.3,
    borderColor: ORANGE,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reorderBtn: {
    backgroundColor: INK,
    borderColor: INK,
  },
  addText: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
    fontSize: 12.5,
    letterSpacing: 0.4,
  },
  addTextReorder: {
    color: '#FFFFFF',
  },
  vegBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
