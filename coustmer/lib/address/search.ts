import { addressApi, type AddressSuggestion, type GeocodeResult } from '@/lib/address/api';
import {
  googlePlacesApi,
  type PlacesSearchBias,
} from '@/lib/address/google-places';
import {
  assertGoogleMapsApiKey,
  googleMapsErrorMessage,
} from '@/lib/google-maps';

export type SearchAddressesOptions = {
  bias?: PlacesSearchBias;
};

/**
 * Place search — Google Places only (Zomato/Swiggy production path).
 * Throws a clear error when the key is missing or Google rejects the request.
 */
export async function searchAddresses(
  query: string,
  options?: SearchAddressesOptions
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  assertGoogleMapsApiKey();

  try {
    const google = await googlePlacesApi.autocomplete(trimmed, options?.bias);
    if (google.length > 0) return google.slice(0, 10);

    // Backend autocomplete also uses Google Maps on the server.
    const backend = await addressApi.autocomplete(trimmed).catch(() => [] as AddressSuggestion[]);
    if (backend.length > 0) return backend.slice(0, 10);

    return [];
  } catch (err) {
    throw new Error(
      googleMapsErrorMessage(err, 'Google Places search failed. Check your Maps API key and Places API enablement.')
    );
  }
}

export async function geocodeAddress(input: {
  placeId?: string;
  address?: string;
  lat?: number;
  lng?: number;
}): Promise<GeocodeResult> {
  if (
    typeof input.lat === 'number' &&
    typeof input.lng === 'number' &&
    Number.isFinite(input.lat) &&
    Number.isFinite(input.lng)
  ) {
    return {
      lat: input.lat,
      lng: input.lng,
      formattedAddress: input.address,
    };
  }

  assertGoogleMapsApiKey();

  try {
    if (
      input.placeId ||
      (input.address && input.address.trim().length > 0)
    ) {
      return await googlePlacesApi.geocode(input);
    }
  } catch (err) {
    // Server geocode is also Google-backed.
    try {
      return await addressApi.geocode(input);
    } catch {
      throw new Error(
        googleMapsErrorMessage(
          err,
          'Google Geocoding failed. Enable Geocoding API and Places API for this key.'
        )
      );
    }
  }

  try {
    return await addressApi.geocode(input);
  } catch (err) {
    throw new Error(
      googleMapsErrorMessage(err, 'Could not resolve this location with Google Maps.')
    );
  }
}

export async function reverseGeocodeAddress(input: {
  lat: number;
  lng: number;
}): Promise<string | null> {
  assertGoogleMapsApiKey();

  try {
    const google = await googlePlacesApi.reverseGeocode(input);
    if (google) return google;
  } catch (err) {
    try {
      const backend = await addressApi.reverseGeocode(input);
      if (backend) return backend;
    } catch {
      throw new Error(
        googleMapsErrorMessage(
          err,
          'Google reverse geocoding failed. Enable Geocoding API for this key.'
        )
      );
    }
  }

  try {
    return await addressApi.reverseGeocode(input);
  } catch (err) {
    throw new Error(
      googleMapsErrorMessage(err, 'Could not reverse-geocode this pin with Google Maps.')
    );
  }
}
