import { Image } from 'expo-image';
import { Star, Store } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DishPrice } from '@/components/restaurant/DishPrice';
import { fonts } from '@/constants/typography';
import type { SearchDish } from '@/lib/search/types';

import { searchColors } from '../search-styles';

/** Dish card: veg mark, name, price and outlet on the left; photo with a View pill on the right. */
export const CategoryDishRow = memo(function CategoryDishRow({
  dish,
  onPress,
}: {
  dish: SearchDish;
  onPress: (dish: SearchDish) => void;
}) {
  const closed = dish.restaurantIsOpen === false;
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(dish)}
      accessibilityLabel={`${dish.name} from ${dish.restaurantName ?? 'restaurant'}${closed ? ', closed now' : ''}`}
    >
      <View style={styles.info}>
        <View style={styles.tags}>
          {dish.isVeg !== undefined ? (
            <View style={[styles.veg, !dish.isVeg && styles.nonVeg]}>
              <View style={[styles.vegDot, !dish.isVeg && styles.nonVegDot]} />
            </View>
          ) : null}
          {dish.isBestSeller ? (
            <View style={styles.badge}>
              <Star color="#B45309" fill="#B45309" size={9} />
              <Text style={styles.badgeText}>Bestseller</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.name} numberOfLines={2}>{dish.name}</Text>
        <DishPrice price={dish.price} discountedPrice={dish.discountedPrice} size="sm" />
        {dish.description ? <Text style={styles.desc} numberOfLines={2}>{dish.description}</Text> : null}
        <View style={styles.storeRow}>
          <Store color={searchColors.orange} size={12} strokeWidth={2.4} />
          <Text style={styles.store} numberOfLines={1}>{dish.restaurantName || 'Restaurant'}</Text>
          {closed ? (
            <Text style={styles.closed}>· Closed now</Text>
          ) : dish.distanceKm != null ? (
            <Text style={styles.meta}>· {dish.distanceKm} km</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.media}>
        <View style={styles.thumb}>
          {dish.imageUrl ? (
            <Image source={{ uri: dish.imageUrl }} style={[styles.image, closed && styles.dim]} contentFit="cover"
              transition={180} />
          ) : (
            <Text style={styles.letter}>{dish.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={[styles.cta, closed && styles.ctaClosed]}>
          <Text style={[styles.ctaText, closed && styles.ctaTextClosed]}>{closed ? 'CLOSED' : 'VIEW'}</Text>
        </View>
      </View>
    </Pressable>
  );
});

const THUMB = 118;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    paddingBottom: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F1F3',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.96 },
  info: { flex: 1, gap: 5 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 16 },
  veg: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.4,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVeg: { borderColor: '#DC2626' },
  vegDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  nonVegDot: { backgroundColor: '#DC2626' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontFamily: fonts.uiBold, fontSize: 10.5, color: '#B45309' },
  name: { fontFamily: fonts.displayBold, fontSize: 16, lineHeight: 20, color: searchColors.ink },
  desc: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 16, color: searchColors.muted },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  store: { flexShrink: 1, fontFamily: fonts.uiSemi, fontSize: 12.5, color: '#3F3F46' },
  meta: { fontFamily: fonts.uiMedium, fontSize: 12, color: searchColors.muted },
  closed: { fontFamily: fonts.uiMedium, fontSize: 12, color: '#DC2626' },
  media: { width: THUMB, alignItems: 'center' },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 16,
    backgroundColor: searchColors.peach,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  dim: { opacity: 0.45 },
  letter: { fontFamily: fonts.displayBold, fontSize: 34, color: '#FDBA74' },
  cta: {
    position: 'absolute',
    bottom: -12,
    minWidth: 88,
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  ctaClosed: { borderColor: '#E4E4E7' },
  ctaText: { fontFamily: fonts.uiBold, fontSize: 13, letterSpacing: 0.6, color: '#EA580C' },
  ctaTextClosed: { color: '#A1A1AA' },
});
