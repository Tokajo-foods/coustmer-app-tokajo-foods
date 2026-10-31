import type { RestaurantDetailTab } from '@/components/restaurant/detail/RestaurantDetailTabs';
import {
  useFullMenu,
  useKitchenAlerts,
  useNotifyOpen,
  useRestaurant,
  useRestaurantBySlug,
  useRestaurantHolidays,
  useRestaurantHygiene,
  useRestaurantOffers,
  useRestaurantRatings,
  useRestaurantSpecialHours,
  useRestaurantTimings,
  useUnavailableItemIds,
} from '@/lib/restaurant/hooks';
import { useRestaurantReviewStats } from '@/lib/review/hooks';

/** Every query the restaurant page needs; tab-only data loads when that tab opens. */
export function useRestaurantDetailData(input: {
  idParam?: string;
  slugParam?: string;
  coords: { lat: number; lng: number } | null;
  tab: RestaurantDetailTab;
  signedIn: boolean;
}) {
  const { idParam, slugParam, coords, tab } = input;
  const slugOnly = Boolean(slugParam) && !idParam;
  const slugQuery = useRestaurantBySlug(slugOnly ? slugParam || '' : '', coords);
  const idQuery = useRestaurant(idParam || '', coords);
  const restaurant = slugOnly ? slugQuery : idQuery;
  const id = restaurant.data?.id || idParam || '';

  return {
    id,
    restaurant,
    menu: useFullMenu(id),
    reviewStats: useRestaurantReviewStats(id, { enabled: Boolean(id) }),
    timings: useRestaurantTimings(id),
    offers: useRestaurantOffers(id, { enabled: tab === 'Offers' }),
    holidays: useRestaurantHolidays(id, { enabled: tab === 'Info' }),
    specialHours: useRestaurantSpecialHours(id, { enabled: tab === 'Info' }),
    hygiene: useRestaurantHygiene(id, { enabled: tab === 'Info' }),
    ratingsHistogram: useRestaurantRatings(id, { enabled: tab === 'Reviews' }),
    unavailableIds: useUnavailableItemIds(id).data,
    alerts: useKitchenAlerts({ enabled: Boolean(input.signedIn && id) }),
    notifyOpen: useNotifyOpen(id),
  };
}
