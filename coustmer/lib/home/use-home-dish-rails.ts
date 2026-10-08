import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { api } from '@/lib/api';
import type { HomeFeed } from '@/lib/customer/types';
import type { HomeOrderAgainDish, HomeRestaurantCard, HomeTrendingDish } from '@/lib/home/types';
import { orderApi } from '@/lib/order/api';
import type { Restaurant } from '@/lib/restaurant/types';

const ITEMS = '/api/v1/restaurant-service/restaurants';

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

async function orderAgainFromHistory(): Promise<HomeOrderAgainDish[]> {
  const result = await orderApi.getOrders({ page: 1, limit: 8 });
  const seen = new Set<string>();
  const out: HomeOrderAgainDish[] = [];
  for (const order of result.orders) {
    if (
      order.status === 'cancelled' ||
      order.status === 'rejected' ||
      order.status === 'pending_payment' ||
      !order.restaurantId
    ) {
      continue;
    }
    for (const item of order.items) {
      const id = (item.menuItemId || item.id || '').trim();
      if (!id || id === 'undefined' || id === 'null' || !item.name) continue;
      const price = item.price > 0 ? item.price : 0;
      if (price <= 0) continue;
      const key = `${order.restaurantId}:${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
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
      if (out.length >= 12) return out;
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
  const feedHasDishes = Boolean(
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
    enabled: !feedLoading && !feedHasDishes && restaurants.length > 0,
    staleTime: 60_000,
  });

  const again = useQuery({
    queryKey: ['home', 'order-again-fallback'],
    queryFn: orderAgainFromHistory,
    enabled: loggedIn && !feedLoading && !(feed?.orderAgain?.length),
    staleTime: 60_000,
  });

  const feedRails = useMemo(() => {
    const sampled = sample.data ?? [];
    const trendingDishes = feed?.trendingDishes?.length
      ? feed.trendingDishes
      : feed?.dishesToTry?.length
        ? feed.dishesToTry
        : sampled.filter((_, index) => index % 2 === 0);
    const suggestedItems = feed?.suggestedItems?.length
      ? feed.suggestedItems
      : sampled.filter((_, index) => index % 2 === 1);
    const orderAgain = feed?.orderAgain?.length ? feed.orderAgain : (again.data ?? []);
    const topRated = feed?.topRated?.length
      ? feed.topRated
      : restaurants.slice(0, 10).map(restaurantCard);

    if (!feed && !trendingDishes.length && !suggestedItems.length && !orderAgain.length && !topRated.length) {
      return undefined;
    }

    return {
      banners: feed?.banners ?? [],
      radiusKm: feed?.radiusKm ?? 0,
      vegOnly: feed?.vegOnly ?? false,
      trending: feed?.trending ?? [],
      newlyAdded: feed?.newlyAdded ?? [],
      topRated,
      pureVeg: feed?.pureVeg ?? [],
      forYou: feed?.forYou ?? [],
      orderAgain,
      dishesToTry: feed?.dishesToTry?.length ? feed.dishesToTry : trendingDishes,
      suggestedItems,
      trendingDishes,
    } satisfies HomeFeed;
  }, [again.data, feed, restaurants, sample.data]);

  const homeLoading =
    feedLoading ||
    (!feedHasDishes && sample.isLoading) ||
    (loggedIn && !(feed?.orderAgain?.length) && again.isLoading);

  return { feedRails, homeLoading };
}
