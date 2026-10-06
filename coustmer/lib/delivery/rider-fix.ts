/** Customer map and rider pin. Hidden until the rider accepts the trip. */

export const RIDER_FIX_STALE_MS = 45_000;

const TO_RESTAURANT = new Set([
  'accepted',
  'arrived',
  'arrived_at_restaurant',
  'returning_to_restaurant',
]);

const TO_HOME = new Set([
  'picked_up',
  'out_for_delivery',
  'on_the_way',
  'arrived_at_customer',
  'at_customer',
]);

export type RiderPoint = {
  lat: number;
  lng: number;
  heading?: number;
  accuracy?: number;
  updatedAt?: string;
};

export type RouteLeg = 'restaurant' | 'home';

/** Delivery trip status only. Kitchen "accepted" must not be passed in. */
export function trackingMapVisible(status: string | null | undefined): boolean {
  return routeLeg(status) != null;
}

export function routeLeg(status: string | null | undefined): RouteLeg | null {
  if (!status) return null;
  const key = status.trim().toLowerCase();
  if (TO_HOME.has(key)) return 'home';
  if (TO_RESTAURANT.has(key)) return 'restaurant';
  return null;
}

export function riderLocationVisible(status: string | null | undefined): boolean {
  return trackingMapVisible(status);
}

export function readLatLng(source: object | null | undefined): { lat: number; lng: number } | null {
  if (!source) return null;
  const raw = source as Record<string, unknown>;
  const lat = asNum(raw.latitude ?? raw.lat);
  const lng = asNum(raw.longitude ?? raw.lng ?? raw.lon);
  if (lat == null || lng == null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

export function fixAgeMs(updatedAt: string | undefined, now = Date.now()): number | null {
  if (!updatedAt) return null;
  const ms = Date.parse(updatedAt);
  if (Number.isNaN(ms)) return null;
  return Math.max(0, now - ms);
}

export function isFixStale(
  updatedAt: string | undefined,
  now = Date.now(),
  forced = false,
): boolean {
  if (forced) return true;
  const age = fixAgeMs(updatedAt, now);
  if (age == null) return false;
  return age > RIDER_FIX_STALE_MS;
}

function asNum(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}
