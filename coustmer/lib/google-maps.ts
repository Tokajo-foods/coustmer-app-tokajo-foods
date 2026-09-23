/**
 * Google Maps Platform helpers for the customer app.
 * Production: Maps must use EXPO_PUBLIC_GOOGLE_MAPS_API_KEY — no other map providers.
 */

export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

export const GOOGLE_MAPS_MISSING_KEY_MESSAGE =
  'Google Maps API key is missing. Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to baby-codes/coustmer/.env, enable Maps SDK / Places / Geocoding / Directions in Google Cloud, then restart Expo with: npx expo start -c';

export const GOOGLE_MAPS_LOAD_FAILED_MESSAGE =
  'Google Maps failed to load. Check that EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is valid, billing is enabled, and these APIs are turned on: Maps JavaScript API, Places API, Places API (New), Geocoding API, Directions API.';

export function isGoogleMapsConfigured(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

export function assertGoogleMapsApiKey(): void {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error(GOOGLE_MAPS_MISSING_KEY_MESSAGE);
  }
}

/** Human-readable Maps / Places failure for UI. */
export function googleMapsErrorMessage(err: unknown, fallback?: string): string {
  if (!GOOGLE_MAPS_API_KEY) return GOOGLE_MAPS_MISSING_KEY_MESSAGE;
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback ?? GOOGLE_MAPS_LOAD_FAILED_MESSAGE;
}
