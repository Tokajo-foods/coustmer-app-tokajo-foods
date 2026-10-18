import { Image } from 'expo-image';
import { ChevronRight, Store } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { formatInr } from '@/lib/format/money';
import type { SearchDish } from '@/lib/search/types';

import { searchColors } from '../search-styles';

/** A dish under a cuisine: photo, veg mark, price and the restaurant serving it. */
export const CategoryDishRow = memo(function CategoryDishRow({
  dish,
  onPress,
}: {
  dish: SearchDish;
  onPress: (dish: SearchDish) => void;
}) {
  const closed = dish.restaurantIsOpen === false;
  const hasDeal = dish.discountedPrice !== undefined && dish.discountedPrice < dish.price;
  return (
    <Pressable
      style={styles.row}
      android_ripple={{ color: '#F4F4F5' }}
      onPress={() => onPress(dish)}
      accessibilityLabel={`${dish.name} from ${dish.restaurantName ?? 'restaurant'}`}
    >
      <View style={styles.info}>
        {dish.isVeg !== undefined ? (
          <View style={[styles.veg, !dish.isVeg && styles.nonVeg]}>
            <View style={[styles.vegDot, !dish.isVeg && styles.nonVegDot]} />
          </View>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>{dish.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatInr(hasDeal ? dish.discountedPrice : dish.price)}</Text>
          {hasDeal ? <Text style={styles.strike}>{formatInr(dish.price)}</Text> : null}
          {dish.isBestSeller ? <Text style={styles.badge}>Bestseller</Text> : null}
        </View>
        <View style={styles.storeRow}>
          <Store color={searchColors.muted} size={12} strokeWidth={2.2} />
          <Text style={styles.store} numberOfLines={1}>{dish.restaurantName || 'Restaurant'}</Text>
          {closed ? <Text style={styles.closed}>· Closed now</Text> : null}
          <ChevronRight color="#CBD5E1" size={14} />
        </View>
      </View>
      <View style={styles.thumb}>
        {dish.imageUrl ? (
          <Image source={{ uri: dish.imageUrl }} style={[styles.image, closed && styles.dim]} contentFit="cover"
            transition={180} />
        ) : (
          <Text style={styles.letter}>{dish.name.charAt(0)}</Text>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E4E7',
  },
  info: { flex: 1, gap: 4 },
  veg: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.4,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVeg: { borderColor: '#DC2626' },
  vegDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  nonVegDot: { backgroundColor: '#DC2626' },
  name: { fontFamily: fonts.displayBold, fontSize: 15.5, color: searchColors.ink },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontFamily: fonts.uiBold, fontSize: 14, color: searchColors.ink },
  strike: { fontFamily: fonts.ui, fontSize: 12.5, color: '#A1A1AA', textDecorationLine: 'line-through' },
  badge: {
    fontFamily: fonts.uiBold,
    fontSize: 10.5,
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    overflow: 'hidden',
  },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  store: { flexShrink: 1, fontFamily: fonts.uiMedium, fontSize: 12.5, color: searchColors.muted },
  closed: { fontFamily: fonts.uiMedium, fontSize: 12.5, color: '#DC2626' },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  dim: { opacity: 0.5 },
  letter: { fontFamily: fonts.displayBold, fontSize: 26, color: '#A1A1AA' },
});
