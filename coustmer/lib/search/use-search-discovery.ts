import { useCallback, useMemo, useState } from 'react';

import { useHomeFeed, useSuggestedItems } from '@/lib/customer/hooks';
import { DEFAULT_HOME_FILTERS } from '@/lib/home/filters';
import type { HomeRestaurantCard, HomeTrendingDish } from '@/lib/home/types';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { useNearbyRestaurants } from '@/lib/restaurant/hooks';
import { homeFiltersToNearbyParams } from '@/lib/restaurant/nearby-params';
import { useDeliveryCoords } from '@/store/delivery-location-store';

import { isClosed, rankPopularDishes, rankPopularRestaurants } from './discovery-ranking';

const DISH_COUNT = 12;
const RESTAURANT_COUNT = 8;

export type SearchDiscovery = {
  hasLocation: boolean;
  loading: boolean;
  /** Restaurant lookup failed and there is nothing cached to show. */
  failed: boolean;
  dishesLoading: boolean;
  dishes: HomeTrendingDish[];
  restaurants: HomeRestaurantCard[];
  retry: () => void;
};

/**
 * Search landing suggestions, only from restaurants that deliver to the pin.
 * Restaurants use the same nearby query as the home list (shared cache, so it
 * matches what home shows). Dishes come from the suggested-items sample plus
 * the home feed's ordered-most dishes when that area has them.
 */
export function useSearchDiscovery(): SearchDiscovery {
  const coords = useDeliveryCoords();
  const [seed] = useState(() => Math.random());

  const nearbyParams = useMemo(
    () =>
      coords?.lat && coords?.lng
        ? homeFiltersToNearbyParams(coords, DEFAULT_HOME_FILTERS, {
            radius: CUSTOMER_DISCOVERY_RADIUS_KM,
            limit: 40,
          })
        : null,
    [coords],
  );
  const nearby = useNearbyRestaurants(nearbyParams);
  const suggested = useSuggestedItems();
  const feed = useHomeFeed();

  const retry = useCallback(() => {
    void nearby.refetch();
    void suggested.refetch();
  }, [nearby, suggested]);

  const nearbyRows = nearby.data?.restaurants;
  const trendingDishes = feed.data?.trendingDishes;
  const sampledDishes = suggested.data;

  const ranked = useMemo(() => {
    const rows = nearbyRows ?? [];
    const inRange = new Map(rows.map((r) => [r.id, isClosed(r)] as const));
    return {
      restaurants: rankPopularRestaurants(rows, RESTAURANT_COUNT),
      dishes: rankPopularDishes(trendingDishes ?? [], sampledDishes ?? [], inRange, seed, DISH_COUNT),
    };
  }, [nearbyRows, trendingDishes, sampledDishes, seed]);

  const hasLocation = Boolean(nearbyParams);
  return {
    hasLocation,
    loading: hasLocation && nearby.isLoading && !nearbyRows,
    failed: hasLocation && nearby.isError && !nearbyRows,
    dishesLoading: hasLocation && suggested.isLoading && !sampledDishes,
    dishes: ranked.dishes,
    restaurants: ranked.restaurants,
    retry,
  };
}
