import { haversineKm } from '@/lib/location/haversine';

type Outlet = {
  lat?: number;
  lng?: number;
  maxDeliveryRadius?: number;
};

/** Straight-line check so the cart can reject a pin before the bill request. */
export function outsideRestaurantRange(
  outlet: Outlet | null | undefined,
  pin: { lat: number; lng: number },
): string | null {
  if (outlet?.lat == null || outlet.lng == null) return null;
  const radius = outlet.maxDeliveryRadius && outlet.maxDeliveryRadius > 0
    ? outlet.maxDeliveryRadius
    : 10;
  const km = haversineKm(outlet.lat, outlet.lng, pin.lat, pin.lng);
  if (km <= radius) return null;
  return `Out of range. This restaurant delivers within ${radius} km.`;
}

export function isRangeError(message: string | null | undefined): boolean {
  if (!message) return false;
  return message.toLowerCase().includes('out of range');
}
