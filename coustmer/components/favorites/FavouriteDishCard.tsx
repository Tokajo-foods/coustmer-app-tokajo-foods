import { Image } from 'expo-image';
import { Heart, UtensilsCrossed } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DishPrice } from '@/components/restaurant/DishPrice';
import { fonts } from '@/constants/typography';
import type { FavouriteDish } from '@/lib/customer/types';

export function FavouriteDishCard({
  dish,
  onRemove,
  removing,
}: {
  dish: FavouriteDish;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.imgWrap}>
        {dish.imageUrl ? (
          <Image source={{ uri: dish.imageUrl }} style={styles.img} contentFit="cover" />
        ) : (
          <View style={[styles.img, styles.imgFallback]}>
            <UtensilsCrossed size={24} color="#D1D5DB" strokeWidth={1.5} />
          </View>
        )}
        {dish.isVeg !== undefined && (
          <View style={[styles.vegDot, { borderColor: dish.isVeg ? '#16A34A' : '#DC2626' }]}>
            <View style={[styles.vegInner, { backgroundColor: dish.isVeg ? '#16A34A' : '#DC2626' }]} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{dish.name}</Text>
        {dish.restaurantName ? (
          <Text style={styles.resto} numberOfLines={1}>{dish.restaurantName}</Text>
        ) : null}
        <View style={styles.meta}>
          {dish.price != null ? (
            <DishPrice price={dish.price} discountedPrice={dish.discountedPrice} size="sm" />
          ) : null}
          {typeof dish.rating === 'number' && dish.rating > 0 ? (
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>★ {dish.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        disabled={removing}
        style={styles.heartBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {removing ? (
          <ActivityIndicator size="small" color="#F43F5E" />
        ) : (
          <Heart size={20} color="#F43F5E" fill="#F43F5E" strokeWidth={2} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    elevation: 1,
  },
  imgWrap: { position: 'relative', marginRight: 12 },
  img: { width: 72, height: 72, borderRadius: 12 },
  imgFallback: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  vegDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegInner: { width: 7, height: 7, borderRadius: 3.5 },
  info: { flex: 1 },
  name: { fontFamily: fonts.displayBold, fontSize: 15, color: '#0B1220', letterSpacing: -0.2, marginBottom: 2 },
  resto: { fontFamily: fonts.ui, fontSize: 12, color: '#6B7280', marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  ratingPill: { backgroundColor: '#16A34A', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  ratingText: { fontFamily: fonts.uiBold, fontSize: 10, color: '#FFFFFF' },
  heartBtn: { padding: 6 },
});
