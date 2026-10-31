import { useQuery } from '@tanstack/react-query';

import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { getNearbyFoodCategories } from '@/lib/restaurant/food-categories-api';

export const foodCategoryKeys = {
  nearby: (lat: number, lng: number, radius: number) =>
    ['food-categories', 'nearby', lat, lng, radius] as const,
};

export function useNearbyFoodCategories(
  coords?: { lat?: number; lng?: number } | null,
  options?: { radiusKm?: number; enabled?: boolean }
) {
  const lat = coords?.lat;
  const lng = coords?.lng;
  const radius = options?.radiusKm ?? CUSTOMER_DISCOVERY_RADIUS_KM;
  const ready =
    typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng);

  return useQuery({
    queryKey: foodCategoryKeys.nearby(lat ?? 0, lng ?? 0, radius),
    queryFn: () => getNearbyFoodCategories({ lat: lat as number, lng: lng as number, radiusKm: radius }),
    enabled: (options?.enabled ?? true) && ready,
    staleTime: 15_000,
    refetchOnMount: 'always',
    retry: 1,
  });
}
