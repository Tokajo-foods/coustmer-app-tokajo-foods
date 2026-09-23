import { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TokajoRestaurantCard } from '@/components/home/tokajo/TokajoRestaurantCard';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';
import type { Restaurant } from '@/lib/restaurant/types';

type Props = {
  restaurants: Restaurant[];
  favoriteIds?: string[];
  loading?: boolean;
  onToggleFavorite?: (id: string) => void;
  onPressRestaurant: (id: string) => void;
};

/** Horizontal rail of restaurant cards — ScrollView avoids nested FlatList jank. */
export const TokajoRestaurantRail = memo(function TokajoRestaurantRail({
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
    <ScrollView
      horizontal
      {...PREMIUM_HORIZONTAL_LIST}
      contentContainerStyle={styles.row}
    >
      {restaurants.map((item) => (
        <TokajoRestaurantCard
          key={item.id}
          restaurant={item}
          isFavorite={favoriteIds.includes(item.id)}
          onToggleFavorite={onToggleFavorite}
          onPress={onPressRestaurant}
        />
      ))}
    </ScrollView>
  );
});

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
    height: 236,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },
});
