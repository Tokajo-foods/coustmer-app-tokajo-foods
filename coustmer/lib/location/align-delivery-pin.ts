import { geocodeAddress } from '@/lib/address/search';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import {
  extractCityFromAddress,
  isCoordinateFallbackAddress,
  normalizeCityName,
  normalizeLat,
  normalizeLng,
} from '@/lib/location/format';
import { haversineKm } from '@/lib/location/haversine';

export type AlignablePin = {
  lat: number;
  lng: number;
  formattedAddress: string;
  city?: string;
};

const GENERIC_LABEL =
  /^(home|work|other|office|current location|selected location)$/i;

function canGeocodeAddress(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3 || isCoordinateFallbackAddress(trimmed)) return false;
  if (GENERIC_LABEL.test(trimmed)) return false;
  return true;
}

function geocodeQuery(loc: AlignablePin): string | null {
  const text = loc.formattedAddress?.trim() ?? '';
  if (canGeocodeAddress(text)) return text;
  const city = loc.city?.trim() ?? '';
  if (city.length >= 3 && !GENERIC_LABEL.test(city) && !isCoordinateFallbackAddress(city)) {
    return city;
  }
  return null;
}

/**
 * If the saved label and the pin are in different places, trust the address
 * text (the place the customer picked) and move the pin to it.
 * A pin already within the discovery radius of that address is kept.
 */
export async function alignDeliveryPin<T extends AlignablePin>(loc: T): Promise<T> {
  const text = geocodeQuery(loc);
  if (!text) return loc;

  try {
    const geo = await geocodeAddress({ address: text });
    const lat = normalizeLat(geo.lat);
    const lng = normalizeLng(geo.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
      return loc;
    }

    if (haversineKm(loc.lat, loc.lng, lat, lng) <= CUSTOMER_DISCOVERY_RADIUS_KM) {
      return loc;
    }

    const formatted = geo.formattedAddress?.trim() || text;
    const city =
      loc.city ||
      normalizeCityName(extractCityFromAddress(formatted)) ||
      undefined;

    return { ...loc, lat, lng, city };
  } catch {
    return loc;
  }
}
