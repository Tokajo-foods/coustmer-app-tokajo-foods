import { reverseGeocodeAddress } from '@/lib/address/search';
import {
  extractCityFromAddress,
  isCoordinateFallbackAddress,
  normalizeCityName,
  normalizeLat,
  normalizeLng,
  isPlusCodeToken,
  shortAddressLabel,
} from '@/lib/location/format';
import type { DeliveryLocation } from '@/store/delivery-location-store';

export type ResolvedPlace = {
  label: string;
  formattedAddress: string;
  city?: string;
  lat: number;
  lng: number;
};

/** Turn lat/lng into a human address + city (Google reverse geocode only). */
export async function resolvePlaceFromCoords(input: {
  lat: number;
  lng: number;
  source?: DeliveryLocation['source'];
  preferredAddress?: string;
}): Promise<ResolvedPlace> {
  const lat = normalizeLat(input.lat);
  const lng = normalizeLng(input.lng);

  let formatted =
    input.preferredAddress &&
    !isCoordinateFallbackAddress(input.preferredAddress)
      ? input.preferredAddress
      : null;

  if (!formatted) {
    formatted = await reverseGeocodeAddress({ lat, lng });
  }

  if (!formatted) {
    formatted = 'Selected location';
  }

  let city = normalizeCityName(extractCityFromAddress(formatted));
  if (city && isCoordinateFallbackAddress(city)) {
    city = undefined;
  }

  const labelSource = input.source === 'gps' ? 'gps' : 'search';
  let label = shortAddressLabel(formatted, labelSource);
  if (label === 'Current location' || label === 'Selected location') {
    label = city || label;
  }

  return {
    label,
    formattedAddress: formatted,
    city,
    lat,
    lng,
  };
}

export function isBadStoredLocation(location: DeliveryLocation | null): boolean {
  if (!location) return false;
  if (isCoordinateFallbackAddress(location.formattedAddress)) return true;
  if (isCoordinateFallbackAddress(location.label)) return true;
  if (isPlusCodeToken(location.label.split(',')[0])) return true;
  if (isPlusCodeToken(location.formattedAddress.split(',')[0])) return true;
  if (location.city && isCoordinateFallbackAddress(location.city)) return true;
  if (location.city && /^lng\b/i.test(location.city)) return true;
  if (Math.abs(location.lng) > 180) return true;
  return false;
}
