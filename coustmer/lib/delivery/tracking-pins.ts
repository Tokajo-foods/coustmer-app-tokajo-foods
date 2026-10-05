import { readLatLng } from './rider-fix';

export type MapPins = {
  restLat: number | null;
  restLng: number | null;
  custLat: number | null;
  custLng: number | null;
};

/** Restaurant and the customer's selected drop, from the tracker DTO or the order address. */
export function resolveTrackingPins(input: {
  restaurantLat?: number;
  restaurantLng?: number;
  customerLat?: number;
  customerLng?: number;
  addressLat?: number | string | null;
  addressLng?: number | string | null;
}): MapPins {
  const home = readLatLng({
    latitude: input.customerLat ?? input.addressLat,
    longitude: input.customerLng ?? input.addressLng,
  });
  const restaurant = readLatLng({
    latitude: input.restaurantLat,
    longitude: input.restaurantLng,
  });
  return {
    restLat: restaurant?.lat ?? null,
    restLng: restaurant?.lng ?? null,
    custLat: home?.lat ?? null,
    custLng: home?.lng ?? null,
  };
}

/** Reads pickup/drop from delivery-service, plus older location shapes. */
export function readTrackerPins(raw: Record<string, unknown>): {
  restaurantLat?: number;
  restaurantLng?: number;
  customerLat?: number;
  customerLng?: number;
} {
  const restaurant = readPoint(raw.pickup ?? raw.restaurantLocation ?? raw.pickupLocation);
  const home = readPoint(raw.drop ?? raw.customerLocation ?? raw.dropLocation ?? raw.deliveryLocation);
  return {
    restaurantLat: restaurant?.lat,
    restaurantLng: restaurant?.lng,
    customerLat: home?.lat,
    customerLng: home?.lng,
  };
}

function readPoint(value: unknown): { lat: number; lng: number } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const direct = readLatLng(record);
  if (direct) return direct;
  const coords = record.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  return readLatLng({ longitude: coords[0], latitude: coords[1] });
}
