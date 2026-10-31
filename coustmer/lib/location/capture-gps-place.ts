import * as Location from 'expo-location';

import { resolvePlaceFromCoords } from '@/lib/location/resolve-place';
import type { DeliveryLocation } from '@/store/delivery-location-store';

const LAST_MAX_AGE_MS = 10 * 60_000;
const LAST_ACCURACY_M = 2000;
const FRESH_WAIT_MS = 4000;
/** No cached fix (fresh install / phone just rebooted): a cold network fix can take several seconds. */
const COLD_FIX_WAIT_MS = 10_000;
const ADDRESS_WAIT_MS = 2500;

function withDeadline<T>(work: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

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

function fallbackPlace(lat: number, lng: number): DeliveryLocation {
  return {
    label: 'Current location',
    formattedAddress: 'Current location',
    lat,
    lng,
    source: 'gps',
    pinTrusted: true,
    updatedAt: Date.now(),
  };
}

async function placeFromFix(fix: Location.LocationObject): Promise<DeliveryLocation> {
  const lat = fix.coords.latitude;
  const lng = fix.coords.longitude;
  const resolved = await withDeadline(
    resolvePlaceFromCoords({ lat, lng, source: 'gps' }),
    ADDRESS_WAIT_MS,
  );
  return resolved ? toDelivery(resolved) : fallbackPlace(lat, lng);
}

async function freshFix(): Promise<Location.LocationObject | null> {
  return withDeadline(
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: false,
    }),
    FRESH_WAIT_MS,
  );
}

/**
 * Prefer a recent fix so the home pin appears immediately.
 * A slower satellite reading must not keep the screen on "Detecting".
 */
export async function captureGpsPlace(
  onQuick?: (location: DeliveryLocation) => void,
): Promise<DeliveryLocation> {
  const freshPromise = freshFix();
  const last = await withDeadline(
    Location.getLastKnownPositionAsync({
      maxAge: LAST_MAX_AGE_MS,
      requiredAccuracy: LAST_ACCURACY_M,
    }),
    1200,
  );

  if (last) {
    onQuick?.(fallbackPlace(last.coords.latitude, last.coords.longitude));
    const quick = await placeFromFix(last);
    void freshPromise.then((fresh) => {
      if (!fresh) return;
      const moved =
        Math.abs(fresh.coords.latitude - last.coords.latitude) > 0.002 ||
        Math.abs(fresh.coords.longitude - last.coords.longitude) > 0.002;
      if (!moved) return;
      void placeFromFix(fresh).then((better) => onQuick?.(better));
    });
    return quick;
  }

  const fresh =
    (await freshPromise) ??
    (await withDeadline(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      COLD_FIX_WAIT_MS,
    ));
  if (!fresh) throw new Error('LOCATION_TIMEOUT');
  onQuick?.(fallbackPlace(fresh.coords.latitude, fresh.coords.longitude));
  return placeFromFix(fresh);
}
