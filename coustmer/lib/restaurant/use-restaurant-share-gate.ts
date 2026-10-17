import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { restaurantWithinDiscovery } from '@/lib/restaurant/within-radius';
import type { Restaurant } from '@/lib/restaurant/types';
import { useDeliveryCoords } from '@/store/delivery-location-store';
import { useRestaurantShareUiStore } from '@/store/restaurant-share-ui-store';

/** Block shared deep-links when the outlet is outside the 15 km pin radius. */
export function useRestaurantShareGate(
  restaurant: Restaurant | null | undefined,
  fromShare: boolean
) {
  const router = useRouter();
  const coords = useDeliveryCoords();
  const showNotServiceable = useRestaurantShareUiStore((s) => s.showNotServiceable);
  const checkedId = useRef<string | null>(null);

  useEffect(() => {
    if (!fromShare || !restaurant?.id) return;
    if (checkedId.current === restaurant.id) return;

    const lat = coords?.lat;
    const lng = coords?.lng;
    const hasPin =
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng);

    if (!hasPin) return;

    checkedId.current = restaurant.id;
    const ok = restaurantWithinDiscovery(
      restaurant,
      { lat, lng },
      CUSTOMER_DISCOVERY_RADIUS_KM
    );

    if (!ok) {
      showNotServiceable(restaurant.name || 'This restaurant');
      if (router.canGoBack()) router.back();
      else router.replace('/home');
    }
  }, [fromShare, restaurant?.id, restaurant?.name, coords?.lat, coords?.lng, router, showNotServiceable]);
}
