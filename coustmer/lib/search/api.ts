import { searchLiveMenus, toCategoryDishes, toCombined, toSuggestions } from '@/lib/search/live-menu-search';
import type {
  SearchCategoryDishesParams,
  SearchCategoryDishesResult,
  SearchCombinedParams,
  SearchCombinedResult,
  SearchRestaurantsParams,
  SearchRestaurantsResult,
  SearchSuggestionsParams,
  SearchSuggestionsResult,
} from '@/lib/search/types';

export const searchApi = {
  /** Dishes and restaurants from the live menus near the delivery pin. */
  getSuggestions: async (p: SearchSuggestionsParams): Promise<SearchSuggestionsResult> => {
    const hit = await searchLiveMenus(p);
    return toSuggestions(p.q, hit);
  },

  /** Full results after the customer submits a search. */
  searchCombined: async (p: SearchCombinedParams): Promise<SearchCombinedResult> => {
    const hit = await searchLiveMenus(p);
    return toCombined(p.q, hit);
  },

  /** Restaurant-only text search (browse screen). */
  searchRestaurants: async (p: SearchRestaurantsParams): Promise<SearchRestaurantsResult> => {
    const term = (p.q || p.cuisine || '').trim();
    if (!term) return { restaurants: [], total: 0 };
    const hit = await searchLiveMenus({ q: term, lat: p.lat, lng: p.lng, radius: p.radius });
    return { restaurants: hit.restaurants, total: hit.restaurants.length };
  },

  /** Every matching dish in range for a tapped cuisine or category name. */
  getCategoryDishes: async (p: SearchCategoryDishesParams): Promise<SearchCategoryDishesResult> => {
    const term = (p.name || p.slug).trim();
    const hit = await searchLiveMenus({ ...p, q: term });
    return toCategoryDishes(term, hit);
  },
};
