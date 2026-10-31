import { api } from '@/lib/api';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { resolveMediaUrl } from '@/lib/restaurant/media';
import type { SearchCategory, SearchDish, SearchRestaurant } from '@/lib/search/types';

const RESTAURANT_BASE = '/api/v1/restaurant-service/restaurants';

type Raw = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

/** Backend caps radius at 15 km; hooks pass meters. */
function radiusKm(radius: number | undefined): number {
  if (radius == null) return CUSTOMER_DISCOVERY_RADIUS_KM;
  const km = radius > 100 ? radius / 1000 : radius;
  return Math.min(15, Math.max(0.5, km));
}

export type LiveHit = {
  query: string;
  restaurants: SearchRestaurant[];
  dishes: SearchDish[];
  categories: SearchCategory[];
};

const EMPTY = (q: string): LiveHit => ({ query: q, restaurants: [], dishes: [], categories: [] });

/** Dishes, restaurants and categories from live menus that deliver to the pin. */
export async function searchLiveMenus(input: {
  q: string;
  lat?: number;
  lng?: number;
  radius?: number;
}): Promise<LiveHit> {
  const q = input.q.trim().slice(0, 80);
  if (input.lat == null || input.lng == null || !q) return EMPTY(q);
  const res = await api.get<{ data?: { restaurants?: Raw[]; dishes?: Raw[]; categories?: Raw[] } }>(
    `${RESTAURANT_BASE}/nearby/menu-search`,
    {
      params: { q, lat: input.lat, lng: input.lng, radius: radiusKm(input.radius) },
      withCredentials: true,
      timeout: 12_000,
    },
  );
  const data = res.data?.data ?? {};
  return {
    query: q,
    restaurants: (data.restaurants ?? []).map(mapRestaurant).filter((r) => r.id),
    dishes: (data.dishes ?? []).map(mapDish).filter((d) => d.id && d.restaurantId),
    categories: (data.categories ?? []).map(mapCategory).filter((c) => c.name && c.slug),
  };
}

function mapRestaurant(raw: Raw): SearchRestaurant {
  const prep = num(raw.avgPrepTime);
  return {
    id: String(raw.id ?? ''),
    name: str(raw.name) ?? 'Restaurant',
    imageUrl: resolveMediaUrl(str(raw.imageUrl)),
    cuisines: Array.isArray(raw.cuisines) ? raw.cuisines.map(String) : undefined,
    rating: num(raw.rating),
    distance: num(raw.distanceKm),
    deliveryTime: prep ? `${prep} mins` : undefined,
    isOnline: typeof raw.isOnline === 'boolean' ? raw.isOnline : undefined,
    matchReason: raw.matchReason === 'name' || raw.matchReason === 'cuisine' || raw.matchReason === 'serves_dish'
      ? raw.matchReason
      : undefined,
    matchedDishCount: num(raw.matchedDishCount),
  };
}

function mapDish(raw: Raw): SearchDish {
  const offer = num(raw.discountedPrice);
  const matched = raw.matchedBy;
  return {
    id: String(raw.id ?? ''),
    name: str(raw.name) ?? 'Dish',
    description: str(raw.description),
    price: num(raw.price) ?? 0,
    discountedPrice: offer !== undefined && offer > 0 ? offer : undefined,
    imageUrl: resolveMediaUrl(str(raw.image)),
    isVeg: typeof raw.isVeg === 'boolean' ? raw.isVeg : undefined,
    isBestSeller: raw.isBestSeller === true,
    restaurantId: String(raw.restaurantId ?? ''),
    restaurantName: str(raw.restaurantName),
    restaurantImageUrl: resolveMediaUrl(str(raw.restaurantImage)),
    restaurantIsOpen: typeof raw.restaurantIsOnline === 'boolean' ? raw.restaurantIsOnline : undefined,
    distanceKm: num(raw.distanceKm),
    categoryId: str(raw.categoryId),
    categoryName: str(raw.categoryName),
    foodCategoryId: str(raw.foodCategoryId),
    matchedBy: matched === 'name' || matched === 'category' || matched === 'description' ? matched : undefined,
  };
}

function mapCategory(raw: Raw): SearchCategory {
  return {
    id: String(raw.id ?? raw.slug ?? ''),
    name: str(raw.name) ?? '',
    slug: str(raw.slug) ?? '',
    imageUrl: resolveMediaUrl(str(raw.imageUrl)),
    itemCount: num(raw.itemCount),
    restaurantCount: num(raw.restaurantCount),
    source: raw.source === 'menu_section' ? 'menu_section' : 'food_category',
  };
}
