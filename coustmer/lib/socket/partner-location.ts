import { useCallback, useEffect, useState } from 'react';

import { isFixStale, readLatLng, type RiderPoint } from '@/lib/delivery/rider-fix';
import { useSocketEvent } from '@/lib/socket/hooks';

export type PartnerLocationState = {
  fix: RiderPoint | null;
  stale: boolean;
};

/**
 * Live rider GPS for one order. Reads latitude/longitude and lat/lng.
 * A fix older than 45s, or a tracking:stale event, freezes the marker.
 */
export function usePartnerLocationSocket(orderId: string): PartnerLocationState {
  const [fix, setFix] = useState<RiderPoint | null>(null);
  const [forcedStale, setForcedStale] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(timer);
  }, []);

  const onLocation = useCallback((data: {
    orderId: string;
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    heading?: number;
    accuracy?: number;
    updatedAt?: string;
    timestamp?: string;
    receivedAt?: string;
  }) => {
    if (data.orderId !== orderId) return;
    const point = readLatLng(data);
    if (!point) return;
    setForcedStale(false);
    setFix({
      ...point,
      heading: data.heading,
      accuracy: data.accuracy,
      updatedAt: data.updatedAt || data.timestamp || data.receivedAt || new Date().toISOString(),
    });
  }, [orderId]);

  const onStale = useCallback((data: { orderId: string }) => {
    if (data.orderId !== orderId) return;
    setForcedStale(true);
  }, [orderId]);

  useSocketEvent('partner:location', onLocation);
  useSocketEvent('tracking:location', onLocation);
  useSocketEvent('tracking:stale', onStale);

  return { fix, stale: isFixStale(fix?.updatedAt, now, forcedStale) };
}
