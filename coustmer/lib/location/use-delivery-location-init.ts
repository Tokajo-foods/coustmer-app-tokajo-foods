import * as Location from 'expo-location';
import { useEffect, useRef } from 'react';

import { addressApi } from '@/lib/address/api';
import { formatAddressLabel } from '@/lib/address/types';
import {
  extractCityFromAddress,
  normalizeCityName,
} from '@/lib/location/format';
import { alignDeliveryPin } from '@/lib/location/align-delivery-pin';
import { captureGpsPlace } from '@/lib/location/capture-gps-place';
import {
  isBadStoredLocation,
  resolvePlaceFromCoords,
} from '@/lib/location/resolve-place';
import { useAuthStore } from '@/store/auth-store';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';

/**
 * Startup order (Swiggy-style):
 * 1. Keep persisted pin for this user if present
 * 2. Else load default/first saved address from API
 * 3. Else optionally GPS (only when logged out / no saved addresses)
 * Never overwrite an existing saved/persisted pin with GPS.
 */
export function useDeliveryLocationInit() {
  const authHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const hasHydrated = useDeliveryLocationStore((s) => s.hasHydrated);
  const location = useDeliveryLocationStore((s) => s.location);
  const isDetecting = useDeliveryLocationStore((s) => s.isDetecting);
  const setLocation = useDeliveryLocationStore((s) => s.setLocation);
  const setDetecting = useDeliveryLocationStore((s) => s.setDetecting);
  const setLocationGate = useDeliveryLocationStore((s) => s.setLocationGate);
  const promptDismissed = useDeliveryLocationStore((s) => s.locationPromptDismissed);

  const repaired = useRef(false);
  const bootstrapDone = useRef(false);
  const gpsStarted = useRef(false);

  useEffect(() => {
    repaired.current = false;
    bootstrapDone.current = false;
    gpsStarted.current = false;
    useDeliveryLocationStore.setState({ locationPromptDismissed: false, locationGate: 'idle' });
  }, [userId]);

  // 1 + 2: After auth + store hydrate, prefer account saved address if pin empty.
  useEffect(() => {
    if (!hasHydrated || !authHydrated) return;
    if (bootstrapDone.current) return;

    // Already have a pin (persisted or bound) — do not re-ask.
    if (location) {
      bootstrapDone.current = true;
      return;
    }

    // Guest / not logged in: nothing to fetch from address-service.
    if (!token || !userId) {
      bootstrapDone.current = true;
      return;
    }

    let cancelled = false;
    bootstrapDone.current = true;

    void (async () => {
      setDetecting(true);
      try {
        const addresses = await addressApi.list();
        if (cancelled) return;

        const preferred =
          addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
        if (!preferred) return;

        // If something else set a pin while we fetched, keep it.
        const current = useDeliveryLocationStore.getState().location;
        if (current) return;

        setLocation({
          label: formatAddressLabel(preferred.label) || 'Home',
          formattedAddress: preferred.formattedAddress,
          city: normalizeCityName(
            extractCityFromAddress(preferred.formattedAddress) ||
              preferred.city
          ),
          lat: preferred.lat,
          lng: preferred.lng,
          source: 'saved',
          savedAddressId: preferred.id,
          updatedAt: Date.now(),
        });
      } catch {
        // Fall through — GPS / manual sheet may help.
      } finally {
        if (!cancelled) setDetecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    hasHydrated,
    authHydrated,
    token,
    userId,
    location,
    setDetecting,
    setLocation,
  ]);

  // Snap a saved/searched pin onto the address text when they are different cities.
  // Home and nearby stay idle until this finishes so the previous city cannot flash.
  useEffect(() => {
    if (!hasHydrated || !location) return;
    if (location.source === 'gps' || location.pinTrusted) return;

    let cancelled = false;
    const snapshot = location.updatedAt;
    setDetecting(true);

    void alignDeliveryPin(location)
      .then((next) => {
        if (cancelled) return;
        const current = useDeliveryLocationStore.getState().location;
        if (!current || current.updatedAt !== snapshot) return;
        setLocation({
          ...current,
          lat: next.lat,
          lng: next.lng,
          city: next.city ?? current.city,
          pinTrusted: true,
          updatedAt: Date.now(),
        });
      })
      .finally(() => {
        if (!cancelled) setDetecting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    hasHydrated,
    location?.updatedAt,
    location?.pinTrusted,
    location?.source,
    location?.formattedAddress,
    location?.lat,
    location?.lng,
    setDetecting,
    setLocation,
  ]);

  // Repair junk "Lat / Lng …" labels without changing the pin.
  useEffect(() => {
    if (!hasHydrated || !authHydrated || !location || repaired.current || isDetecting) {
      return;
    }
    if (!isBadStoredLocation(location)) return;
    repaired.current = true;

    void (async () => {
      setDetecting(true);
      try {
        const resolved = await resolvePlaceFromCoords({
          lat: location.lat,
          lng: location.lng,
          source: location.source,
        });
        setLocation({
          ...resolved,
          source: location.source,
          savedAddressId: location.savedAddressId,
          pinTrusted: location.pinTrusted,
          updatedAt: Date.now(),
        });
      } catch {
        // keep existing
      } finally {
        setDetecting(false);
      }
    })();
  }, [hasHydrated, authHydrated, location, isDetecting, setDetecting, setLocation]);

  // GPS on entry when location is already on. Otherwise ask to turn it on.
  useEffect(() => {
    if (!hasHydrated || !authHydrated || promptDismissed) return;
    if (gpsStarted.current) return;
    gpsStarted.current = true;

    let cancelled = false;

    void (async () => {
      try {
        const [perm, servicesOn] = await Promise.all([
          Location.getForegroundPermissionsAsync(),
          Location.hasServicesEnabledAsync(),
        ]);
        if (cancelled) return;

        if (perm.status !== 'granted') {
          setLocationGate('denied');
          return;
        }
        if (!servicesOn) {
          setLocationGate('off');
          return;
        }

        setLocationGate('idle');
        setDetecting(true);
        const precise = await captureGpsPlace((quick) => {
          if (!cancelled) setLocation(quick);
        });
        if (!cancelled) setLocation(precise);
      } catch {
        if (!cancelled && !useDeliveryLocationStore.getState().location) {
          setLocationGate('off');
        }
      } finally {
        if (!cancelled) setDetecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    hasHydrated,
    authHydrated,
    promptDismissed,
    userId,
    setDetecting,
    setLocation,
    setLocationGate,
  ]);
}
