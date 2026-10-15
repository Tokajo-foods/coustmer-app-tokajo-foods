/** Customer map and rider pin. Hidden until the rider accepts the trip; same statuses as the server share window. */

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
  /** When the fix was taken, on this device's clock (so phone clock skew never marks a live pin stale). */
  updatedAt?: string;
  /** Server timestamp of the fix, used only to drop out-of-order socket events. */
  serverAt?: string;
};

/** REST returns `ageSeconds`; convert it to a device-clock timestamp. */
export function localFixTime(ageSeconds: unknown, fallbackIso?: string, now = Date.now()): string | undefined {
  if (typeof ageSeconds === 'number' && Number.isFinite(ageSeconds) && ageSeconds >= 0) {
    return new Date(now - ageSeconds * 1000).toISOString();
  }
  return fallbackIso;
}

/** True when `next` is not older than `prev` by server time (or either has no server time). */
export function isNewerServerFix(prev: RiderPoint | null, next: RiderPoint): boolean {
  if (!prev?.serverAt || !next.serverAt) return true;
  const a = Date.parse(prev.serverAt);
  const b = Date.parse(next.serverAt);
  if (Number.isNaN(a) || Number.isNaN(b)) return true;
  return b > a;
}

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

/** Prefer the GPS point recorded most recently. */
export function fresherRiderPoint(
  socketFix: RiderPoint | null,
  polledFix: RiderPoint | null,
): RiderPoint | null {
  if (!socketFix) return polledFix;
  if (!polledFix) return socketFix;
  const socketAge = fixAgeMs(socketFix.updatedAt);
  const polledAge = fixAgeMs(polledFix.updatedAt);
  if (socketAge == null) return polledAge == null ? socketFix : polledFix;
  if (polledAge == null) return socketFix;
  return polledAge < socketAge ? polledFix : socketFix;
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
