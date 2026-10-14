import { useMemo } from 'react';

import type { HomeFeed } from '@/lib/customer/types';
import type { HomeRestaurantCard } from '@/lib/home/types';
import type { Restaurant } from '@/lib/restaurant/types';

/** Rails stay hidden until this many restaurants are listed around the pin. */
export const DISCOVERY_MIN_RESTAURANTS = 5;
/** Cards shown on each rail once the area qualifies. */
export const HOME_RAIL_CARDS = 10;

function onePerRestaurant<T extends { restaurantId: string }>(rows: T[], limit = HOME_RAIL_CARDS): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (!row.restaurantId || seen.has(row.restaurantId)) continue;
    seen.add(row.restaurantId);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

function ratedCards(cards: HomeRestaurantCard[]): HomeRestaurantCard[] {
  return cards.filter((card) => (card.rating ?? 0) > 0).slice(0, HOME_RAIL_CARDS);
}

type Input = {
  feed?: HomeFeed;
  feedLoading: boolean;
  restaurants: Restaurant[];
};

/** Home rails from the customer home feed only. */
export function useHomeDishRails({ feed, feedLoading, restaurants }: Input) {
  const showDiscovery = restaurants.length >= DISCOVERY_MIN_RESTAURANTS;

  const feedRails = useMemo(() => {
    const topRated = showDiscovery ? ratedCards(feed?.topRated ?? []) : [];
    const topRatedIds = new Set(topRated.map((card) => card.id));
    const trending = showDiscovery
      ? (feed?.trending ?? []).filter((card) => !topRatedIds.has(card.id)).slice(0, HOME_RAIL_CARDS)
      : [];
    const suggestedItems = showDiscovery
      ? (feed?.suggestedItems ?? []).slice(0, HOME_RAIL_CARDS)
      : [];
    const orderAgain = showDiscovery
      ? onePerRestaurant(feed?.orderAgain ?? [], HOME_RAIL_CARDS)
      : [];

    if (!feed && !trending.length && !suggestedItems.length && !orderAgain.length && !topRated.length) {
      return undefined;
    }

    return {
      banners: feed?.banners ?? [],
      radiusKm: feed?.radiusKm ?? 0,
      vegOnly: feed?.vegOnly ?? false,
      trending,
      newlyAdded: showDiscovery ? (feed?.newlyAdded ?? []).slice(0, HOME_RAIL_CARDS) : [],
      topRated,
      pureVeg: showDiscovery ? (feed?.pureVeg ?? []).slice(0, HOME_RAIL_CARDS) : [],
      forYou: showDiscovery ? (feed?.forYou ?? []).slice(0, HOME_RAIL_CARDS) : [],
      orderAgain,
      dishesToTry: showDiscovery ? (feed?.dishesToTry ?? []).slice(0, HOME_RAIL_CARDS) : [],
      suggestedItems,
      trendingDishes: showDiscovery ? (feed?.trendingDishes ?? []).slice(0, HOME_RAIL_CARDS) : [],
    } satisfies HomeFeed;
  }, [feed, showDiscovery]);

  return { feedRails, homeLoading: feedLoading };
}
