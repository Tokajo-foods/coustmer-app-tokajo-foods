import { FlatList, StyleSheet, View } from 'react-native';

import { TokajoDishCard } from '@/components/home/tokajo/TokajoDishCard';
import type { HomeTrendingDish } from '@/lib/home/types';

type Props = {
  dishes: HomeTrendingDish[];
  favoriteIds?: string[];
  loading?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onPressDish: (restaurantId: string) => void;
};

/** Horizontal rail of dish cards (Trending / Order again). */
export function TokajoDishRail({
  dishes,
  favoriteIds = [],
  loading,
  onToggleFavorite,
  onPressDish,
}: Props) {
  if (loading && dishes.length === 0) {
    return (
      <View style={styles.skeletonRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.skeletonCard} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={dishes}
      keyExtractor={(d) => d.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      renderItem={({ item }) => (
        <TokajoDishCard
          dish={item}
          isFavorite={favoriteIds.includes(item.restaurantId)}
          onToggleFavorite={onToggleFavorite}
          onPress={onPressDish}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  skeletonCard: {
    width: 152,
    height: 190,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
  },
});
