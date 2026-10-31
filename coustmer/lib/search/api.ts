import { searchLiveMenus } from '@/lib/search/live-menu-search';
import { toCategoryDishes, toCombined, toSuggestions } from '@/lib/search/suggestion-builder';
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
  /** Autocomplete: completions, categories, dishes and restaurants near the delivery pin. */
  getSuggestions: async (p: SearchSuggestionsParams): Promise<SearchSuggestionsResult> => {
    const hit = await searchLiveMenus(p);
    return toSuggestions(p.q, hit, p.limit);
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

  /** Every matching dish in range for a tapped category. */
  getCategoryDishes: async (p: SearchCategoryDishesParams): Promise<SearchCategoryDishesResult> => {
    const term = (p.name || p.slug.replace(/[-_]+/g, ' ')).trim();
    const hit = await searchLiveMenus({ ...p, q: term });
    return toCategoryDishes(term, p.slug, hit);
  },
};
