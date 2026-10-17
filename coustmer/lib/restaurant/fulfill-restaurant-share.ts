import type { Router } from 'expo-router';

import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { restaurantApi } from '@/lib/restaurant/api';
import type { ParsedRestaurantShareLink } from '@/lib/restaurant/share-link';
import { restaurantWithinDiscovery } from '@/lib/restaurant/within-radius';
import { usePendingRestaurantShareStore } from '@/store/pending-restaurant-share-store';

export type FulfillRestaurantShareResult =
  | { status: 'opened'; restaurantId: string }
  | { status: 'not_serviceable'; restaurantName: string }
  | { status: 'not_found' }
  | { status: 'no_location' };

export async function fulfillRestaurantShare(input: {
  link: ParsedRestaurantShareLink;
  coords?: { lat?: number | null; lng?: number | null };
  router: Router;
}): Promise<FulfillRestaurantShareResult> {
  const { link, coords, router } = input;
  const lat = coords?.lat;
  const lng = coords?.lng;
  const hasPin =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  let restaurant;
  try {
    if (link.slug) {
      restaurant = await restaurantApi.getRestaurantBySlug(
        link.slug,
        hasPin ? { lat, lng } : undefined
      );
    } else if (link.restaurantId) {
      restaurant = await restaurantApi.getRestaurant(
        link.restaurantId,
        hasPin ? { lat, lng } : undefined
      );
    } else {
      return { status: 'not_found' };
    }
  } catch {
    return { status: 'not_found' };
  }

  if (!restaurant?.id) return { status: 'not_found' };

  if (!hasPin) {
    return { status: 'no_location' };
  }

  const inRange = restaurantWithinDiscovery(
    restaurant,
    { lat: lat as number, lng: lng as number },
    CUSTOMER_DISCOVERY_RADIUS_KM
  );

  usePendingRestaurantShareStore.getState().clearPending();

  if (!inRange) {
    return { status: 'not_serviceable', restaurantName: restaurant.name || 'This restaurant' };
  }

  const q = link.fromShare ? '?share=1' : '';
  if (restaurant.slug) {
    router.replace(`/restaurants/slug/${encodeURIComponent(restaurant.slug)}${q}`);
  } else {
    router.replace(`/restaurants/${restaurant.id}${q}`);
  }

  return { status: 'opened', restaurantId: restaurant.id };
}
