import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

import { fulfillRestaurantShare } from '@/lib/restaurant/fulfill-restaurant-share';
import { parseRestaurantShareUrl } from '@/lib/restaurant/share-link';
import { useAuthStore } from '@/store/auth-store';
import { useDeliveryCoords } from '@/store/delivery-location-store';
import { usePendingRestaurantShareStore } from '@/store/pending-restaurant-share-store';
import { useRestaurantShareUiStore } from '@/store/restaurant-share-ui-store';

/**
 * Captures restaurant share URLs, queues them when logged out, and opens the
 * outlet after login when the user is within the 15 km discovery radius.
 */
export function RestaurantShareLinkHandler() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const coords = useDeliveryCoords();
  const setPending = usePendingRestaurantShareStore((s) => s.setPending);
  const pending = usePendingRestaurantShareStore((s) => s.pending);
  const showNotServiceable = useRestaurantShareUiStore((s) => s.showNotServiceable);
  const handling = useRef(false);

  const runFulfill = async (link: ReturnType<typeof parseRestaurantShareUrl>) => {
    if (!link || handling.current) return;
    handling.current = true;
    try {
      if (!token || !user) {
        setPending(link);
        router.replace('/?auth=login');
        return;
      }

      const result = await fulfillRestaurantShare({
        link,
        coords,
        router,
      });

      if (result.status === 'not_serviceable') {
        showNotServiceable(result.restaurantName);
        router.replace('/home');
      } else if (result.status === 'not_found') {
        Alert.alert('Link expired', 'This restaurant is no longer available.');
      } else if (result.status === 'no_location') {
        Alert.alert(
          'Set delivery location',
          'Choose your delivery address so we can check if this restaurant delivers to you.'
        );
        router.replace('/home');
      }
    } finally {
      handling.current = false;
    }
  };

  const ingestUrl = (url: string | null) => {
    const parsed = parseRestaurantShareUrl(url);
    if (!parsed) return;
    void runFulfill(parsed);
  };

  useEffect(() => {
    if (!isHydrated) return;
    void Linking.getInitialURL().then(ingestUrl);
    const sub = Linking.addEventListener('url', (event) => ingestUrl(event.url));
    return () => sub.remove();
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || !token || !user || !pending) return;
    void runFulfill(pending);
  }, [isHydrated, token, user, pending?.slug, pending?.restaurantId]);

  return null;
}
