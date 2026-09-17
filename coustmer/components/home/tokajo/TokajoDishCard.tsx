import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Plus, RotateCcw, Star } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { SmoothPressable } from '@/components/common/SmoothPressable';
import { fonts } from '@/constants/typography';
import type { HomeTrendingDish } from '@/lib/home/types';

const ORANGE = '#F97316';
const GREEN = '#12833B';
const INK = '#1C1917';

export type DishCardVariant = 'trending' | 'suggested' | 'orderAgain' | 'default';

/** Per-variant image height so rails don't all look identical. */
export const DISH_CARD_WIDTH: Record<DishCardVariant, number> = {
  trending: 168,
  suggested: 182,
  orderAgain: 158,
  default: 168,
};

const IMAGE_HEIGHT: Record<DishCardVariant, number> = {
  trending: 116,
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

  return (
    <Pressable
      style={[
        styles.card,
        { width: DISH_CARD_WIDTH[variant] },
        isSuggested && styles.cardSuggested,
      ]}
      onPress={() => onPress(dish.restaurantId)}
    >
      <View style={[styles.imageWrap, { height: IMAGE_HEIGHT[variant] }]}>
        {dish.imageUrl ? (
          <Image
            source={{ uri: dish.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={120}
            recyclingKey={dish.id}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.image, styles.imageEmpty]} />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)']}
          style={styles.imageShade}
          pointerEvents="none"
        />

        {tag ? (
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
          <Text style={styles.price}>₹{Math.round(dish.price)}</Text>
          <SmoothPressable
            style={[styles.addBtn, isReorder && styles.reorderBtn]}
            pressScale={0.9}
            onPress={() => onPress(dish.restaurantId)}
            accessibilityLabel={`${isReorder ? 'Reorder' : 'Add'} ${dish.name}`}
          >
            {isReorder ? (
              <RotateCcw color="#FFFFFF" size={13} strokeWidth={2.6} />
            ) : (
              <Plus color="#FFFFFF" size={14} strokeWidth={3} />
            )}
            <Text style={styles.addText}>{isReorder ? 'REPEAT' : 'ADD'}</Text>
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
  cardSuggested: {
    borderWidth: 1,
    borderColor: '#FFE0C2',
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
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: fonts.displayBold,
    fontSize: 15.5,
    color: '#1C1C1C',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  reorderBtn: {
    backgroundColor: INK,
    shadowColor: INK,
  },
  addText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 12,
    letterSpacing: 0.3,
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
