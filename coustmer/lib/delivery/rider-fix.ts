/** Customer-visible rider GPS. Active trip only — not before pickup. */

export const RIDER_FIX_STALE_MS = 45_000;

const VISIBLE = new Set([
  'picked_up',
  'out_for_delivery',
  'on_the_way',
  'arrived_at_customer',
  'at_customer',
  'returning_to_restaurant',
]);

export type RiderPoint = {
  lat: number;
  lng: number;
  heading?: number;
  accuracy?: number;
  updatedAt?: string;
};

export function riderLocationVisible(status: string | null | undefined): boolean {
  if (!status) return false;
  return VISIBLE.has(status.trim().toLowerCase());
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
