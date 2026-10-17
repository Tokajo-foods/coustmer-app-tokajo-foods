import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { searchApi } from '@/lib/search/api';
import type {
  SearchCategoryDishesParams,
  SearchRestaurantsParams,
  SearchScope,
} from '@/lib/search/types';
import { useDeliveryCoords } from '@/store/delivery-location-store';

/** search-service radius is meters; the home list radius is km. */
const SEARCH_RADIUS_M = CUSTOMER_DISCOVERY_RADIUS_KM * 1000;

export const searchKeys = {
  all: ['search'] as const,
  suggestions: (q: string, scope: SearchScope) => [...searchKeys.all, 'suggestions', q, scope] as const,
  combined: (q: string, scope: SearchScope) => [...searchKeys.all, 'combined', q, scope] as const,
  restaurants: (params: SearchRestaurantsParams) => [...searchKeys.all, 'restaurants', params] as const,
  categoryDishes: (params: SearchCategoryDishesParams) => [...searchKeys.all, 'category-dishes', params] as const,
};

/** Debounce a value for search inputs (default 220ms). */
export function useDebouncedValue<T>(value: T, delayMs = 220): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Delivery pin + the home radius. Every search query uses this so results are only
 * restaurants that also appear on the home list. Null until a pin is set.
 */
export function useSearchScope(): SearchScope | null {
  const coords = useDeliveryCoords();
  return useMemo(
    () => (coords ? { lat: coords.lat, lng: coords.lng, radius: SEARCH_RADIUS_M } : null),
    [coords],
  );
}

/** Type-ahead from the first character: dishes, restaurants and cuisines in range. */
export function useSearchSuggestions(q: string, options?: { enabled?: boolean; limit?: number }) {
  const scope = useSearchScope();
  const term = q.trim();
  return useQuery({
    queryKey: searchKeys.suggestions(term, scope ?? {}),
    queryFn: () => searchApi.getSuggestions({ ...scope, q: term, limit: options?.limit ?? 12 }),
    enabled: (options?.enabled ?? true) && Boolean(scope) && term.length >= 1,
    staleTime: 30_000,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

/** Full results after submit: restaurants, dishes and matching cuisines in range. */
export function useSearchCombined(q: string, options?: { enabled?: boolean }) {
  const scope = useSearchScope();
  const term = q.trim();
  return useQuery({
    queryKey: searchKeys.combined(term, scope ?? {}),
    queryFn: () => searchApi.searchCombined({ ...scope, q: term, limit: 30 }),
    enabled: (options?.enabled ?? true) && Boolean(scope) && term.length >= 1,
    staleTime: 30_000,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

/** Restaurant-only text search (browse screen). */
export function useSearchRestaurants(params: SearchRestaurantsParams, options?: { enabled?: boolean }) {
  const hasQuery = Boolean(params.q?.trim() || params.cuisine);
  return useQuery({
    queryKey: searchKeys.restaurants(params),
    queryFn: () => searchApi.searchRestaurants(params),
    enabled: (options?.enabled ?? true) && hasQuery,
    staleTime: 20_000,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}

/** Every dish in range for a cuisine or food category. */
export function useSearchCategoryDishes(input: Omit<SearchCategoryDishesParams, keyof SearchScope>) {
  const scope = useSearchScope();
  const params: SearchCategoryDishesParams = { ...input, ...scope, limit: input.limit ?? 80 };
  return useQuery({
    queryKey: searchKeys.categoryDishes(params),
    queryFn: () => searchApi.getCategoryDishes(params),
    enabled: Boolean(scope) && Boolean(input.slug || input.name),
    staleTime: 60_000,
    retry: 1,
  });
}
