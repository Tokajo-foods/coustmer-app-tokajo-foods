import { useMemo, useState } from 'react';

import { useHomeFeed } from '@/lib/customer/hooks';
import type { HomeRestaurantCard, HomeTrendingDish } from '@/lib/home/types';
import { useDeliveryCoords } from '@/store/delivery-location-store';

const DISH_COUNT = 12;
const RESTAURANT_COUNT = 8;

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
    const openFirst = (r: HomeRestaurantCard) => (r.isOpenNow === false ? 1 : 0);

    return {
      hasLocation: Boolean(coords?.lat && coords?.lng),
      loading: feed.isLoading && !data,
      dishes: [...onePerKitchen, ...extraDishes].slice(0, DISH_COUNT),
      restaurants: seededShuffle(restaurantPool, seed)
        .sort((a, b) => openFirst(a) - openFirst(b))
        .slice(0, RESTAURANT_COUNT),
    };
  }, [coords?.lat, coords?.lng, feed.data, feed.isLoading, seed]);
}
