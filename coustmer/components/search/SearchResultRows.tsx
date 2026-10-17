import { Image } from 'expo-image';
import { Search, Star } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { SearchDish, SearchRestaurant, SearchSuggestion } from '@/lib/search/types';

import { searchColors } from './search-styles';

const { ink: INK, muted: MUTED, border: BORDER } = searchColors;

export const SuggestionRow = memo(function SuggestionRow({
  item,
  onPress,
}: {
  item: SearchSuggestion;
  onPress: (item: SearchSuggestion) => void;
}) {
  return (
    <Pressable style={styles.suggestionRow} onPress={() => onPress(item)} android_ripple={{ color: '#F1F5F9' }}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.suggestionImg} contentFit="cover" transition={150} />
      ) : (
        <View style={styles.suggestionIcon}>
          <Search color={MUTED} size={13} />
        </View>
      )}
      <View style={styles.flex}>
        <Text style={styles.suggestionText} numberOfLines={1}>{item.text}</Text>
        {item.type && item.type !== 'query' ? <Text style={styles.suggestionType}>{item.type}</Text> : null}
      </View>
    </Pressable>
  );
});

export const RestaurantRow = memo(function RestaurantRow({
  restaurant,
  onPress,
}: {
  restaurant: SearchRestaurant;
  onPress: () => void;
}) {
  const cover = restaurant.imageUrl || restaurant.coverUrl;
  return (
    <Pressable style={styles.resultCard} onPress={onPress} android_ripple={{ color: '#F1F5F9' }}>
      {cover ? (
        <Image source={{ uri: cover }} style={styles.resultImage} contentFit="cover" transition={150} />
      ) : (
        <View style={[styles.resultImage, styles.resultImageFallback]}>
          <Text style={styles.resultFallbackLetter}>{restaurant.name?.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.resultMeta} numberOfLines={1}>{restaurant.cuisines?.slice(0, 3).join(', ')}</Text>
        <View style={styles.resultMetaRow}>
          {restaurant.rating ? (
            <View style={styles.ratingChip}>
              <Star color="#FFF" fill="#FFF" size={9} />
              <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
            </View>
          ) : null}
          {restaurant.deliveryTime ? <Text style={styles.resultMeta}>{restaurant.deliveryTime}</Text> : null}
          {restaurant.priceForTwo ? <Text style={styles.resultMeta}>₹{restaurant.priceForTwo} for two</Text> : null}
        </View>
      </View>
    </Pressable>
  );
});

export const DishRow = memo(function DishRow({ dish, onPress }: { dish: SearchDish; onPress: () => void }) {
  return (
    <Pressable style={styles.resultCard} onPress={onPress} android_ripple={{ color: '#F1F5F9' }}>
      {dish.imageUrl ? (
        <Image source={{ uri: dish.imageUrl }} style={styles.resultImage} contentFit="cover" transition={150} />
      ) : (
        <View style={[styles.resultImage, styles.resultImageFallback]}>
          <Text style={styles.resultFallbackLetter}>{dish.name?.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.resultInfo}>
        <View style={styles.dishNameRow}>
          {dish.isVeg !== undefined ? <View style={[styles.vegDot, !dish.isVeg && styles.nonVegDot]} /> : null}
          <Text style={styles.resultName} numberOfLines={1}>{dish.name}</Text>
        </View>
        <Text style={styles.resultMeta} numberOfLines={1}>{dish.restaurantName || 'Restaurant'}</Text>
        <Text style={styles.dishPrice}>₹{dish.price}</Text>
      </View>
    </Pressable>
  );
});

/** Placeholder rows while results load, same size as a real row so nothing jumps. */
export function ResultSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.resultCard}>
          <View style={[styles.resultImage, styles.skeleton]} />
          <View style={styles.resultInfo}>
            <View style={[styles.skeleton, styles.skeletonLine, { width: '62%' }]} />
            <View style={[styles.skeleton, styles.skeletonLine, { width: '40%' }]} />
            <View style={[styles.skeleton, styles.skeletonLine, { width: '28%' }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  suggestionImg: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#F1F5F9' },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: { fontFamily: fonts.uiSemi, fontSize: 14, color: INK },
  suggestionType: { fontFamily: fonts.ui, fontSize: 11, color: MUTED, textTransform: 'capitalize', marginTop: 1 },
  resultCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  resultImage: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#F1F5F9' },
  resultImageFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B' },
  resultFallbackLetter: { fontFamily: fonts.displayBold, fontSize: 24, color: '#FFF' },
  resultInfo: { flex: 1, justifyContent: 'center', gap: 3 },
  resultName: { fontFamily: fonts.displayBold, fontSize: 15, color: INK },
  resultMeta: { fontFamily: fonts.ui, fontSize: 12, color: MUTED },
  resultMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#22C55E',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: { fontFamily: fonts.uiBold, fontSize: 10, color: '#FFF' },
  dishNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vegDot: { width: 10, height: 10, borderRadius: 2, borderWidth: 1.5, borderColor: '#22C55E' },
  nonVegDot: { borderColor: '#EF4444' },
  dishPrice: { fontFamily: fonts.uiSemi, fontSize: 13, color: INK, marginTop: 2 },
  skeleton: { backgroundColor: '#F1F5F9' },
  skeletonLine: { height: 10, borderRadius: 5, marginVertical: 2 },
});
