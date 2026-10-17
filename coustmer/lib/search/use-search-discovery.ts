import { useMemo, useState } from 'react';

import { useHomeFeed } from '@/lib/customer/hooks';
import type { HomeRestaurantCard, HomeTrendingDish } from '@/lib/home/types';
import { useNearbyMindCategories } from '@/lib/restaurant/hooks';
import type { CuisineChip } from '@/lib/restaurant/types';
import { useDeliveryCoords } from '@/store/delivery-location-store';

const DISH_COUNT = 10;
const RESTAURANT_COUNT = 6;
const CRAVING_COUNT = 12;

/** Same seed for one visit, so the mix does not reshuffle on every render. */
function seededShuffle<T>(rows: T[], seed: number): T[] {
  const out = rows.slice();
  let s = Math.floor(seed * 2 ** 31) || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 48271) % 2147483647;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function uniqueBy<T>(rows: T[], key: (row: T) => string): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const k = key(row);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export type SearchDiscovery = {
  hasLocation: boolean;
  loading: boolean;
  cravings: CuisineChip[];
  dishes: HomeTrendingDish[];
  restaurants: HomeRestaurantCard[];
};

/**
 * Search landing suggestions, only from restaurants inside the delivery radius.
 * Reuses the home feed cache, so it is usually instant.
 */
export function useSearchDiscovery(): SearchDiscovery {
  const coords = useDeliveryCoords();
  const [seed] = useState(() => Math.random());
  const feed = useHomeFeed();
  const mind = useNearbyMindCategories(coords, { restaurantLimit: 40 });

  return useMemo(() => {
    const data = feed.data;
    const dishPool = uniqueBy(
      [...(data?.trendingDishes ?? []), ...(data?.dishesToTry ?? []), ...(data?.suggestedItems ?? [])],
      (d) => d.id,
    ).filter((d) => d.name && d.restaurantId);
    const restaurantPool = uniqueBy(
      [...(data?.topRated ?? []), ...(data?.trending ?? []), ...(data?.forYou ?? []), ...(data?.newlyAdded ?? [])],
      (r) => r.id,
    );
    const onePerKitchen = uniqueBy(seededShuffle(dishPool, seed), (d) => d.restaurantId);
    const extraDishes = seededShuffle(dishPool, seed + 0.5).filter((d) => !onePerKitchen.includes(d));
    const cravings = (mind.data?.categories ?? [])
      .filter((c) => (c.restaurantCount ?? 1) > 0)
      .slice(0, CRAVING_COUNT);

    return {
      hasLocation: Boolean(coords?.lat && coords?.lng),
      loading: (feed.isLoading && !data) || (mind.isLoading && !mind.data),
      cravings,
      dishes: [...onePerKitchen, ...extraDishes].slice(0, DISH_COUNT),
      restaurants: seededShuffle(restaurantPool, seed).slice(0, RESTAURANT_COUNT),
    };
  }, [coords?.lat, coords?.lng, feed.data, feed.isLoading, mind.data, mind.isLoading, seed]);
}
