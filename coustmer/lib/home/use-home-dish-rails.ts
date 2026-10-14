import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { api } from '@/lib/api';
import type { HomeFeed } from '@/lib/customer/types';
import type { HomeOrderAgainDish, HomeRestaurantCard, HomeTrendingDish } from '@/lib/home/types';
import { orderApi } from '@/lib/order/api';
import type { Restaurant } from '@/lib/restaurant/types';

const ITEMS = '/api/v1/restaurant-service/restaurants';
/** Every home rail waits until this many restaurants are listed around the pin. */
export const DISCOVERY_MIN_RESTAURANTS = 5;

function asDish(raw: unknown, restaurant: Restaurant): HomeTrendingDish | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = String(row.itemId ?? row._id ?? row.id ?? '').trim();
  const name = typeof row.name === 'string' ? row.name.trim() : '';
  const price = Number(row.price ?? row.effectivePrice ?? 0);
  if (!id || !name || !Number.isFinite(price) || price <= 0) return null;
  if (row.isAvailable === false) return null;
  const image =
    typeof row.imageUrl === 'string'
      ? row.imageUrl
      : typeof row.image === 'string'
        ? row.image
        : null;
  return {
    id,
    name,
    price,
    imageUrl: image,
    isVeg: typeof row.isVeg === 'boolean' ? row.isVeg : undefined,
    rating: typeof row.rating === 'number' ? row.rating : undefined,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
  };
}

/** Menu items from the restaurants already on the home list. */
async function sampleNearbyDishes(restaurants: Restaurant[]): Promise<HomeTrendingDish[]> {
  const sample = restaurants.filter((r) => r.id).slice(0, 8);
  const batches = await Promise.all(
    sample.map(async (restaurant) => {
      try {
        const res = await api.get<{ data?: unknown }>(`${ITEMS}/${restaurant.id}/items`, {
          params: { page: 1, limit: 6, isAvailable: 'true' },
        });
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        const dishes: HomeTrendingDish[] = [];
        for (const row of rows) {
          const dish = asDish(row, restaurant);
          if (!dish) continue;
          dishes.push(dish);
          if (dishes.length >= 2) break;
        }
        return dishes;
      } catch {
        return [] as HomeTrendingDish[];
      }
    }),
  );

  const queues = batches.map((batch) => [...batch]);
  const out: HomeTrendingDish[] = [];
  let moved = true;
  while (moved && out.length < 16) {
    moved = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (!next) continue;
      out.push(next);
      moved = true;
      if (out.length >= 16) break;
    }
  }
  return out;
}

function onePerRestaurant<T extends { restaurantId: string }>(rows: T[], limit = 5): T[] {
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

async function orderAgainFromHistory(): Promise<HomeOrderAgainDish[]> {
  const result = await orderApi.getOrders({ page: 1, limit: 5 });
  const seenRestaurants = new Set<string>();
  const out: HomeOrderAgainDish[] = [];
  for (const order of result.orders) {
    if (out.length >= 5) break;
    if (
      order.status === 'cancelled' ||
      order.status === 'rejected' ||
      order.status === 'pending_payment' ||
      !order.restaurantId ||
      seenRestaurants.has(order.restaurantId)
    ) {
      continue;
    }
    for (const item of order.items) {
      const id = (item.menuItemId || item.id || '').trim();
      if (!id || id === 'undefined' || id === 'null' || !item.name) continue;
      const price = item.price > 0 ? item.price : 0;
      if (price <= 0) continue;
      seenRestaurants.add(order.restaurantId);
      out.push({
        id,
        name: item.name,
        price,
        imageUrl: item.imageUrl ?? null,
        isVeg: item.isVeg,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName || 'Restaurant',
        badge: 'Order again',
      });
      break;
    }
  }
  return out;
}

function restaurantCard(restaurant: Restaurant): HomeRestaurantCard {
  return {
    id: restaurant.id,
    name: restaurant.name,
    image: restaurant.coverUrl || restaurant.imageUrl || null,
    logoUrl: restaurant.logoUrl ?? null,
    rating: restaurant.rating,
    deliveryTime: restaurant.deliveryTime ?? null,
    cuisines: restaurant.cuisines,
    isPureVeg: restaurant.isPureVeg,
    reviewCount: restaurant.reviewCount,
  };
}

type Input = {
  feed?: HomeFeed;
  feedLoading: boolean;
  restaurants: Restaurant[];
  loggedIn: boolean;
};

/** Home rails, filled from nearby menus when the feed has no dish cards. */
export function useHomeDishRails({ feed, feedLoading, restaurants, loggedIn }: Input) {
  const showDiscovery = restaurants.length >= DISCOVERY_MIN_RESTAURANTS;
  const feedHasDishes = showDiscovery && Boolean(
    feed?.trendingDishes?.length ||
      feed?.dishesToTry?.length ||
      feed?.suggestedItems?.length,
  );
  const restaurantKey = restaurants
    .slice(0, 8)
    .map((r) => r.id)
    .join(',');

  const sample = useQuery({
    queryKey: ['home', 'dish-sample', restaurantKey],
    queryFn: () => sampleNearbyDishes(restaurants),
    enabled: showDiscovery && !feedLoading && !feedHasDishes && restaurants.length > 0,
    staleTime: 60_000,
  });

  const again = useQuery({
    queryKey: ['home', 'order-again-fallback'],
    queryFn: orderAgainFromHistory,
    enabled: showDiscovery && loggedIn && !feedLoading && !(feed?.orderAgain?.length),
    staleTime: 60_000,
  });

  const feedRails = useMemo(() => {
    const orderAgain = onePerRestaurant(
      !showDiscovery
        ? []
        : feed?.orderAgain?.length
          ? feed.orderAgain
          : (again.data ?? []),
      5,
    );
    const sampled = showDiscovery ? (sample.data ?? []) : [];
    const rated = (feed?.topRated ?? []).filter((card) => (card.rating ?? 0) > 0);
    const topRated = (!showDiscovery
      ? []
      : rated.length
        ? rated
        : restaurants.filter((r) => (r.rating ?? 0) > 0).map(restaurantCard)
    ).slice(0, 5);
    const topRatedIds = new Set(topRated.map((card) => card.id));
    const apartFromTopRated = (dish: { restaurantId: string }) => !topRatedIds.has(dish.restaurantId);
    const trendingDishes = (!showDiscovery
      ? []
      : feed?.trendingDishes?.length
        ? feed.trendingDishes
        : feed?.dishesToTry?.length
          ? feed.dishesToTry
          : sampled.filter((_, index) => index % 2 === 0)
    ).filter(apartFromTopRated);
    const trendingCapped = onePerRestaurant(trendingDishes, 5);
    const suggestedItems = !showDiscovery
      ? []
      : feed?.suggestedItems?.length
        ? feed.suggestedItems
        : sampled.filter((_, index) => index % 2 === 1);

    const trendingFromFeed = (feed?.trending ?? []).filter((card) => !topRatedIds.has(card.id));
    const trending = (showDiscovery
      ? trendingFromFeed.length
        ? trendingFromFeed
        : restaurants.filter((r) => !topRatedIds.has(r.id)).map(restaurantCard)
      : []
    ).slice(0, 5);

    if (!feed && !trending.length && !trendingCapped.length && !suggestedItems.length && !orderAgain.length && !topRated.length) {
      return undefined;
    }

    return {
      banners: feed?.banners ?? [],
      radiusKm: feed?.radiusKm ?? 0,
      vegOnly: feed?.vegOnly ?? false,
      trending,
      newlyAdded: showDiscovery ? (feed?.newlyAdded ?? []) : [],
      topRated,
      pureVeg: showDiscovery ? (feed?.pureVeg ?? []) : [],
      forYou: showDiscovery ? (feed?.forYou ?? []) : [],
      orderAgain,
      dishesToTry: showDiscovery
        ? onePerRestaurant(
          (feed?.dishesToTry?.length ? feed.dishesToTry : trendingCapped).filter(apartFromTopRated),
          5,
        )
        : [],
      suggestedItems,
      trendingDishes: trendingCapped,
    } satisfies HomeFeed;
  }, [again.data, feed, restaurants, sample.data, showDiscovery]);

  const homeLoading =
    feedLoading ||
    (showDiscovery && !feedHasDishes && sample.isLoading) ||
    (showDiscovery && loggedIn && !(feed?.orderAgain?.length) && again.isLoading);

  return { feedRails, homeLoading };
}
