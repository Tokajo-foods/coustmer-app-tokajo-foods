import axios from 'axios';

import { api } from '@/lib/api';
import {
  mapSearchCategory,
  mapSearchDish,
  mapSearchRestaurant,
  mapSearchSuggestion,
} from '@/lib/search/mappers';
import type {
  SearchCategoryDishesParams,
  SearchCategoryDishesResult,
  SearchCombinedParams,
  SearchCombinedResult,
  SearchRestaurantsParams,
  SearchRestaurantsResult,
  SearchSuggestion,
  SearchSuggestionsParams,
  SearchSuggestionsResult,
} from '@/lib/search/types';

const SEARCH_SERVICE = '/api/v1/search-service';

type Raw = Record<string, unknown>;
type QueryValue = string | number | boolean | undefined;

function query(params: Record<string, QueryValue>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === false) continue;
    qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

function list(value: unknown): Raw[] {
  return Array.isArray(value) ? (value.filter((v) => v && typeof v === 'object') as Raw[]) : [];
}

/** GET on search-service; unwraps `{ success, data }` and throws readable errors. */
async function get(path: string): Promise<Raw> {
  try {
    const res = await api.get<{ success?: boolean; message?: string; data?: unknown }>(
      `${SEARCH_SERVICE}${path}`,
      { withCredentials: true, timeout: 8_000 },
    );
    if (res.data?.success === false) throw new Error(res.data.message || 'Search is unavailable right now');
    const data = res.data?.data;
    return data && typeof data === 'object' ? (data as Raw) : {};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) throw new Error('No internet connection. Check your network and try again.');
      const body = error.response.data as { message?: string } | undefined;
      if (error.response.status >= 500) throw new Error('Search is unavailable right now. Please try again.');
      throw new Error(body?.message || `Search failed (${error.response.status})`);
    }
    throw error;
  }
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export const searchApi = {
  /** GET /suggestions — word-prefix type-ahead for dishes, restaurants and cuisines. */
  getSuggestions: async (p: SearchSuggestionsParams): Promise<SearchSuggestionsResult> => {
    const data = await get(`/suggestions${query({ q: p.q, lat: p.lat, lng: p.lng, radius: p.radius, limit: p.limit, veg: p.veg })}`);
    return {
      query: str(data.query) ?? p.q,
      correctedQuery: str(data.correctedQuery),
      suggestions: list(data.suggestions)
        .map(mapSearchSuggestion)
        .filter((s): s is SearchSuggestion => s !== null),
    };
  },

  /** GET /combined — full results after the customer submits. */
  searchCombined: async (p: SearchCombinedParams): Promise<SearchCombinedResult> => {
    const data = await get(`/combined${query({ q: p.q, lat: p.lat, lng: p.lng, radius: p.radius, limit: p.limit, veg: p.veg })}`);
    return {
      query: str(data.query) ?? p.q,
      correctedQuery: str(data.correctedQuery),
      restaurants: list(data.restaurants).map(mapSearchRestaurant),
      dishes: list(data.dishes).map(mapSearchDish),
      categories: list(data.categories).map(mapSearchCategory).filter((c) => c.name),
    };
  },

  /** GET /restaurants — restaurant-only search (browse screen text filter). */
  searchRestaurants: async (p: SearchRestaurantsParams): Promise<SearchRestaurantsResult> => {
    const data = await get(
      `/restaurants${query({
        q: p.q, cuisine: p.cuisine, lat: p.lat, lng: p.lng, radius: p.radius,
        sort: p.sort, page: p.page, limit: p.limit, veg: p.veg,
      })}`,
    );
    const restaurants = list(data.restaurants).map(mapSearchRestaurant);
    return { restaurants, total: typeof data.total === 'number' ? data.total : restaurants.length };
  },

  /** GET /categories/dishes — every dish in range for a tapped cuisine or food category. */
  getCategoryDishes: async (p: SearchCategoryDishesParams): Promise<SearchCategoryDishesResult> => {
    const data = await get(
      `/categories/dishes${query({
        slug: p.slug, name: p.name, source: p.source, lat: p.lat, lng: p.lng,
        radius: p.radius, limit: p.limit, veg: p.veg,
      })}`,
    );
    const category = (data.category && typeof data.category === 'object' ? data.category : {}) as Raw;
    return {
      category: {
        name: str(category.name) ?? p.name ?? p.slug,
        slug: str(category.slug) ?? p.slug,
        source: category.source === 'cuisine' || category.source === 'food_category' ? category.source : p.source,
        imageUrl: str(category.imageUrl),
      },
      restaurantCount: typeof data.restaurantCount === 'number' ? data.restaurantCount : 0,
      dishes: list(data.dishes).map(mapSearchDish),
    };
  },
};
