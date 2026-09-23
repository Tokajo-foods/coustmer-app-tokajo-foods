import { FlatList, StyleSheet, View } from 'react-native';

import {
  DISH_CARD_WIDTH,
  TokajoDishCard,
  type DishCardVariant,
} from '@/components/home/tokajo/TokajoDishCard';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';
import type { HomeTrendingDish } from '@/lib/home/types';

type Props = {
  dishes: HomeTrendingDish[];
  variant?: DishCardVariant;
  favoriteIds?: string[];
  loading?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onPressDish: (restaurantId: string) => void;
};

/** Horizontal rail of dish cards (Trending / Suggested / Order again). */
export function TokajoDishRail({
  dishes,
  variant = 'default',
  favoriteIds = [],
  loading,
  onToggleFavorite,
  onPressDish,
}: Props) {
  if (loading && dishes.length === 0) {
    return (
      <View style={styles.skeletonRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View
            key={i}
            style={[styles.skeletonCard, { width: DISH_CARD_WIDTH[variant] }]}
          />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={dishes}
      keyExtractor={(d) => d.id}
      {...PREMIUM_HORIZONTAL_LIST}
      contentContainerStyle={styles.row}
      renderItem={({ item, index }) => (
        <TokajoDishCard
          dish={item}
          variant={variant}
          rank={variant === 'trending' ? index + 1 : undefined}
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
    paddingVertical: 6,
    gap: 14,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 14,
  },
  skeletonCard: {
    height: 200,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },
});
