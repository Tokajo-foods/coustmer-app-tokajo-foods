import { api } from '@/lib/api';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import type {
  SearchCategoryDishesResult,
  SearchCombinedResult,
  SearchDish,
  SearchRestaurant,
  SearchSuggestion,
  SearchSuggestionsResult,
} from '@/lib/search/types';

const RESTAURANT_BASE = '/api/v1/restaurant-service/restaurants';

type Raw = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

function radiusKm(radius: number | undefined): number {
  if (radius == null) return CUSTOMER_DISCOVERY_RADIUS_KM;
  return radius > 100 ? radius / 1000 : radius;
}

type LiveHit = { restaurants: SearchRestaurant[]; dishes: SearchDish[] };

export async function searchLiveMenus(input: {
  q: string;
  lat?: number;
  lng?: number;
  radius?: number;
}): Promise<LiveHit> {
  if (input.lat == null || input.lng == null || !input.q.trim()) {
    return { restaurants: [], dishes: [] };
  }
  const res = await api.get<{ data?: { restaurants?: Raw[]; dishes?: Raw[] } }>(
    `${RESTAURANT_BASE}/nearby/menu-search`,
    {
      params: {
        q: input.q.trim(),
        lat: input.lat,
        lng: input.lng,
        radius: radiusKm(input.radius),
      },
      withCredentials: true,
      timeout: 12_000,
    },
  );
  const data = res.data?.data ?? {};
  const restaurants = (data.restaurants ?? []).map(mapRestaurant).filter((r) => r.id);
  const dishes = (data.dishes ?? []).map(mapDish).filter((d) => d.id && d.restaurantId);
  return { restaurants, dishes };
}

function mapRestaurant(raw: Raw): SearchRestaurant {
  return {
    id: String(raw.id ?? ''),
    name: str(raw.name) ?? 'Restaurant',
    imageUrl: str(raw.imageUrl),
    cuisines: Array.isArray(raw.cuisines) ? raw.cuisines.map(String) : undefined,
    rating: num(raw.rating),
    distance: num(raw.distanceKm),
    matchReason: raw.matchReason === 'name' || raw.matchReason === 'cuisine' || raw.matchReason === 'serves_dish'
      ? raw.matchReason
      : undefined,
  };
}

function mapDish(raw: Raw): SearchDish {
  const offer = num(raw.discountedPrice);
  return {
    id: String(raw.id ?? ''),
    name: str(raw.name) ?? 'Dish',
    price: num(raw.price) ?? 0,
    discountedPrice: offer !== undefined && offer > 0 ? offer : undefined,
    imageUrl: str(raw.image),
    isVeg: typeof raw.isVeg === 'boolean' ? raw.isVeg : undefined,
    restaurantId: String(raw.restaurantId ?? ''),
    restaurantName: str(raw.restaurantName),
  };
}

export function toSuggestions(q: string, hit: LiveHit): SearchSuggestionsResult {
  const dishes: SearchSuggestion[] = hit.dishes.map((d) => ({
    id: `dish-${d.id}`,
    type: 'dish',
    text: d.name,
    subtitle: d.restaurantName,
    imageUrl: d.imageUrl,
    restaurantId: d.restaurantId,
    restaurantName: d.restaurantName,
    dishId: d.id,
    price: d.price,
    discountedPrice: d.discountedPrice,
    isVeg: d.isVeg,
  }));
  const restaurants: SearchSuggestion[] = hit.restaurants
    .filter((r) => r.matchReason === 'name' || r.matchReason === 'cuisine')
    .map((r) => ({
      id: `restaurant-${r.id}`,
      type: 'restaurant',
      text: r.name,
      subtitle: r.cuisines?.slice(0, 2).join(', ') || 'Restaurant',
      imageUrl: r.imageUrl,
      restaurantId: r.id,
      rating: r.rating,
    }));
  return { query: q, suggestions: [...dishes, ...restaurants] };
}

export function toCombined(q: string, hit: LiveHit): SearchCombinedResult {
  return { query: q, restaurants: hit.restaurants, dishes: hit.dishes, categories: [] };
}

export function toCategoryDishes(name: string, hit: LiveHit): SearchCategoryDishesResult {
  return {
    category: { name, slug: name, source: 'food_category' },
    restaurantCount: new Set(hit.dishes.map((d) => d.restaurantId)).size,
    dishes: hit.dishes,
  };
}
