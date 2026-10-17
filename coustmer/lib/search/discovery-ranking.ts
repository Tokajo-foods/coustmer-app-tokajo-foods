import type { HomeRestaurantCard, HomeTrendingDish } from '@/lib/home/types';
import type { Restaurant } from '@/lib/restaurant/types';

/** Same seed for one visit, so the mix does not reshuffle on every render. */
export function seededShuffle<T>(rows: T[], seed: number): T[] {
  const out = rows.slice();
  let s = Math.floor(seed * 2 ** 31) || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 48271) % 2147483647;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function uniqueBy<T>(rows: T[], key: (row: T) => string): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const k = key(row);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function distanceKm(r: Restaurant): number | undefined {
  if (typeof r.distanceMeters === 'number' && r.distanceMeters > 0) return r.distanceMeters / 1000;
  if (typeof r.distance === 'number' && r.distance > 0) return r.distance;
  return undefined;
}

export function isClosed(r: Restaurant): boolean {
  return r.isOpenNow === false || r.isOpen === false;
}

export function toRestaurantCard(r: Restaurant): HomeRestaurantCard {
  const rating = r.avgRating ?? r.rating;
  return {
    id: r.id,
    name: r.name,
    image: r.imageUrl || r.coverUrl || null,
    logoUrl: r.logoUrl ?? null,
    rating: typeof rating === 'number' && rating > 0 ? rating : undefined,
    reviewCount: r.totalRatings ?? r.reviewCount,
    deliveryTime: r.deliveryTimeLabel || r.deliveryTime || null,
    cuisines: r.cuisines,
    isPureVeg: r.isPureVeg,
    isOpenNow: !isClosed(r),
    availabilityLabel: isClosed(r) ? r.closedReason || (r.nextOpenAt ? `Opens ${r.nextOpenAt}` : null) : null,
    hoursToday: r.hoursToday ?? null,
    distanceKm: distanceKm(r),
    slug: r.slug ?? null,
    hasOffers: Boolean(r.offer || r.offerBadges?.length),
  };
}

/** Rating weighted by how many people rated it, so 4.6 from 900 beats 5.0 from 2. */
function popularity(r: Restaurant): number {
  const rating = r.avgRating ?? r.rating ?? 0;
  const count = r.totalRatings ?? r.reviewCount ?? 0;
  return rating * Math.log10(10 + count) + (r.isFeatured ? 0.5 : 0);
}

/** Open kitchens first, then most popular. */
export function rankPopularRestaurants(rows: Restaurant[], limit: number): HomeRestaurantCard[] {
  return uniqueBy(rows, (r) => r.id)
    .sort((a, b) => Number(isClosed(a)) - Number(isClosed(b)) || popularity(b) - popularity(a))
    .slice(0, limit)
    .map(toRestaurantCard);
}

/**
 * Ordered-most dishes lead, then sampled menu items shuffled per visit.
 * Dishes from open kitchens come first, and one dish per kitchen before repeats.
 * `inRange` maps restaurant id → closed; dishes from kitchens outside it are dropped.
 */
export function rankPopularDishes(
  trending: HomeTrendingDish[],
  sampled: HomeTrendingDish[],
  inRange: Map<string, boolean>,
  seed: number,
  limit: number,
): HomeTrendingDish[] {
  const pool = uniqueBy([...trending, ...seededShuffle(sampled, seed)], (d) => d.id)
    .filter((d) => d.name && d.restaurantId && (inRange.size === 0 || inRange.has(d.restaurantId)))
    .sort((a, b) => Number(inRange.get(a.restaurantId) ?? false) - Number(inRange.get(b.restaurantId) ?? false));
  const firstPerKitchen = uniqueBy(pool, (d) => d.restaurantId);
  const rest = pool.filter((d) => !firstPerKitchen.includes(d));
  return [...firstPerKitchen, ...rest].slice(0, limit);
}
