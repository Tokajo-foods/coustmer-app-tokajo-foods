import { FlatList, StyleSheet, View } from 'react-native';

import { TokajoRestaurantCard } from '@/components/home/tokajo/TokajoRestaurantCard';
import type { Restaurant } from '@/lib/restaurant/types';

type Props = {
  restaurants: Restaurant[];
  favoriteIds?: string[];
  loading?: boolean;
  onToggleFavorite?: (id: string) => void;
  onPressRestaurant: (id: string) => void;
};

/** Horizontal rail of restaurant cards ("Restaurants Near You"). */
export function TokajoRestaurantRail({
  restaurants,
  favoriteIds = [],
  loading,
  onToggleFavorite,
  onPressRestaurant,
}: Props) {
  if (loading && restaurants.length === 0) {
    return (
      <View style={styles.skeletonRow}>
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={i} style={styles.skeletonCard} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={restaurants}
      keyExtractor={(r) => r.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      renderItem={({ item }) => (
        <TokajoRestaurantCard
          restaurant={item}
          isFavorite={favoriteIds.includes(item.id)}
          onToggleFavorite={onToggleFavorite}
          onPress={onPressRestaurant}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 16,
  },
  skeletonCard: {
    width: 264,
    height: 250,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },
});
