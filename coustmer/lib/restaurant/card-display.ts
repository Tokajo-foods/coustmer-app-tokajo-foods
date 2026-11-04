import type { Restaurant } from '@/lib/restaurant/types';
import { getRestaurantRating } from '@/lib/restaurant/menu-rating';

/** Match restaurant-service DELIVERY_ETA for client-side estimates. */
const RIDER_SPEED_KMH = 22;
const ETA_BUFFER_MIN = 3;
const ETA_RANGE_PAD_MIN = 5;
const MIN_TRAVEL_KM = 0.2;

export function formatDistanceKm(km?: number): string | null {
  if (typeof km !== 'number' || !Number.isFinite(km) || km < 0) return null;
  if (km < 0.1) return 'Nearby';
  return `${km.toFixed(1)} km`;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Prefer API distance; else haversine from user pin → restaurant coords. */
export function resolveRestaurantDistanceKm(
  r: Restaurant,
  user?: { lat?: number; lng?: number } | null
): number | null {
  if (typeof r.distance === 'number' && Number.isFinite(r.distance) && r.distance >= 0) {
    return Math.round(r.distance * 10) / 10;
  }
  const uLat = user?.lat;
  const uLng = user?.lng;
  const rLat = r.lat;
  const rLng = r.lng;
  if (
    typeof uLat === 'number' &&
    typeof uLng === 'number' &&
    typeof rLat === 'number' &&
    typeof rLng === 'number' &&
    Number.isFinite(uLat) &&
    Number.isFinite(uLng) &&
    Number.isFinite(rLat) &&
    Number.isFinite(rLng)
  ) {
    return Math.round(haversineKm(uLat, uLng, rLat, rLng) * 10) / 10;
  }
  return null;
}

function prepMinutesFromRestaurant(r: Restaurant): number {
  const settings =
    r.settings && typeof r.settings === 'object'
      ? (r.settings as Record<string, unknown>)
      : undefined;
  const raw = Number(
    settings?.avgPrepTime ?? settings?.preparationTime ?? 0
  );
  if (Number.isFinite(raw) && raw > 0) return Math.round(raw);
  return 20;
}

/** Detail-page ETA: API label first, else estimate from live pin distance. */
export function restaurantDetailEtaLabel(
  r: Restaurant,
  distanceKm?: number | null
): string | undefined {
  const fromApi = restaurantEtaLabel(r);
  if (fromApi) return fromApi;

  if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return undefined;
  }

  const travelMin =
    distanceKm < MIN_TRAVEL_KM ? 0 : (distanceKm / RIDER_SPEED_KMH) * 60;
  const prep = prepMinutesFromRestaurant(r);
  const mid = Math.max(1, Math.round(prep + travelMin + ETA_BUFFER_MIN));
  const min = Math.max(
    prep > 0 ? Math.min(prep, mid) : 1,
    mid - ETA_RANGE_PAD_MIN
  );
  const max = mid + ETA_RANGE_PAD_MIN;
  return `${min}–${max} mins`;
}

/** IST-friendly label for next open instant from nearby/detail APIs. */
export function formatNextOpenAt(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** IST clock for pause windows, e.g. "4:10 pm". */
function formatIstClock(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function pauseStillActive(r: Restaurant): boolean {
  if (r.kitchenStatus === 'paused') return true;
  if (!r.pausedUntil) return false;
  const until = new Date(r.pausedUntil).getTime();
  return Number.isFinite(until) && until > Date.now();
}

/** Pause window or offline. Null when the kitchen toggle is still online. */
export function restaurantDutyLabel(r: Restaurant): string | null {
  if (pauseStillActive(r)) {
    const from = formatIstClock(r.pausedAt);
    const until = formatIstClock(r.pausedUntil);
    if (from && until) return `On a break from ${from} to ${until}`;
    if (until) return `On a break until ${until}`;
    return r.availabilityLabel?.trim() || 'On a break';
  }
  if (r.kitchenStatus === 'offline') return 'Restaurant is offline';
  if (r.availabilityLabel === 'Restaurant is offline') return r.availabilityLabel;
  if (r.kitchenStatus === 'online') return null;
  if (r.isOnline === false) return 'Restaurant is offline';
  return null;
}

export function restaurantIsClosed(r: Restaurant): boolean {
  if (restaurantDutyLabel(r)) return true;
  if (r.isOnline === true) return false;
  return (
    r.isOpen === false || r.isOpenNow === false || r.isOnline === false
  );
}

/** Closed card copy: break → offline → Opens at … → closedReason → generic. */
export function restaurantClosedLabel(r: Restaurant): string | null {
  const duty = restaurantDutyLabel(r);
  if (duty) return duty;
  if (!restaurantIsClosed(r)) return null;
  const next = formatNextOpenAt(r.nextOpenAt);
  if (next) return `Opens ${next}`;
  const reason = String(r.closedReason ?? '').trim();
  if (reason) return reason;
  return 'Currently closed';
}

/** Live card stars — never invent a rating. */
export function restaurantStars(r: Restaurant): number | undefined {
  return getRestaurantRating(r) ?? undefined;
}

export function restaurantRatingCount(r: Restaurant): number | undefined {
  const n = r.totalRatings ?? r.reviewCount;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : undefined;
}

/** ETA from card DTO: API label first, else promise minutes. */
export function restaurantEtaLabel(r: Restaurant): string | undefined {
  const label = r.deliveryTimeLabel?.trim() || r.deliveryTime?.trim();
  if (label) return label;
  if (typeof r.promiseMinutes === 'number' && r.promiseMinutes > 0) {
    return `${Math.round(r.promiseMinutes)} mins`;
  }
  return undefined;
}

/** Up to 2 live offer badges. Empty when the API has none. */
export function restaurantOfferBadges(r: Restaurant, max = 2): string[] {
  const fromDto = (r.offerBadges ?? [])
    .map((s) => String(s).trim())
    .filter(Boolean);
  if (fromDto.length) return fromDto.slice(0, max);
  const single = r.offer?.trim();
  return single ? [single] : [];
}
