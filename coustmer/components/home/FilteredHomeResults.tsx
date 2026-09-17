import { StyleSheet, Text, View } from 'react-native';

import { TokajoRestaurantListCard } from '@/components/home/tokajo/TokajoRestaurantListCard';
import { fonts } from '@/constants/typography';
import type { Restaurant } from '@/lib/restaurant/types';

type Props = {
  restaurants: Restaurant[];
  favoriteIds: string[];
  onClearFilters: () => void;
  onToggleFavorite: (id: string) => void;
  onPressRestaurant: (id: string) => void;
};

/** Filtered home body — Tokajo list cards, no discovery rails. */
export function FilteredHomeResults({
  restaurants,
  favoriteIds,
  onClearFilters,
  onToggleFavorite,
  onPressRestaurant,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>
          {restaurants.length > 0
            ? `${restaurants.length} restaurant${restaurants.length === 1 ? '' : 's'} found`
            : 'No restaurants found'}
        </Text>
        <Text style={styles.clear} onPress={onClearFilters}>
          Clear filters
        </Text>
      </View>

      {restaurants.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nothing matches these filters. Clear filters to see all restaurants.
          </Text>
        </View>
      ) : (
        restaurants.map((r) => (
          <TokajoRestaurantListCard
            key={r.id}
            restaurant={r}
            isFavorite={favoriteIds.includes(r.id)}
            onToggleFavorite={onToggleFavorite}
            onPress={onPressRestaurant}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 8 },
  head: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#0B1220',
    letterSpacing: -0.3,
  },
  clear: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#F97316',
  },
  empty: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
