import * as Location from 'expo-location';

import { resolvePlaceFromCoords } from '@/lib/location/resolve-place';
import type { DeliveryLocation } from '@/store/delivery-location-store';

const FRESH_MS = 45_000;
const GOOD_ACCURACY_M = 80;

function toDelivery(
  place: Awaited<ReturnType<typeof resolvePlaceFromCoords>>,
): DeliveryLocation {
  return {
    ...place,
    source: 'gps',
    pinTrusted: true,
    updatedAt: Date.now(),
  };
}

/**
 * Show a recent fix immediately, then replace it with a high-accuracy reading.
 */
export async function captureGpsPlace(
  onQuick?: (location: DeliveryLocation) => void,
): Promise<DeliveryLocation> {
  const lastPromise = Location.getLastKnownPositionAsync({
    maxAge: FRESH_MS,
    requiredAccuracy: GOOD_ACCURACY_M,
  });
  const precisePromise = Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const last = await lastPromise;
  if (last) {
    const quick = toDelivery(
      await resolvePlaceFromCoords({
        lat: last.coords.latitude,
        lng: last.coords.longitude,
        source: 'gps',
      }),
    );
    onQuick?.(quick);
  }

  const precise = await precisePromise;
  return toDelivery(
    await resolvePlaceFromCoords({
      lat: precise.coords.latitude,
      lng: precise.coords.longitude,
      source: 'gps',
    }),
  );
}
