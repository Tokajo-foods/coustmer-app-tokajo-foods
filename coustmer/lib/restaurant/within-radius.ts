import { haversineKm } from '@/lib/location/haversine';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import type { Restaurant } from '@/lib/restaurant/types';

/** Drop outlets whose own coordinates sit outside the delivery pin's radius. */
export function restaurantWithinDiscovery(
  restaurant: Restaurant,
  origin: { lat: number; lng: number },
  radiusKm: number = CUSTOMER_DISCOVERY_RADIUS_KM
): boolean {
  const lat = restaurant.lat;
  const lng = restaurant.lng;
  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  ) {
    return haversineKm(origin.lat, origin.lng, lat, lng) <= radiusKm;
  }

  if (typeof restaurant.distance === 'number' && restaurant.distance >= 0) {
    return restaurant.distance <= radiusKm;
  }

  return false;
}
