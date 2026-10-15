import { useCallback, useEffect, useRef, useState } from 'react';

import {
  isFixStale,
  isNewerServerFix,
  readLatLng,
  riderLocationVisible,
  type RiderPoint,
} from '@/lib/delivery/rider-fix';
import { useSocketEvent } from '@/lib/socket/hooks';
import { trackOrder, untrackOrder } from '@/lib/socket/socket';
import type { PartnerLocationEvent } from '@/lib/socket/types';

export type PartnerLocationState = {
  fix: RiderPoint | null;
  stale: boolean;
};

/**
 * Live rider GPS for one order. Reads latitude/longitude and lat/lng.
 * A fix older than 45s, or a tracking:stale event, freezes the marker.
 * Pass `enabled=false` once the trip is over so late events cannot move the pin.
 */
export function usePartnerLocationSocket(orderId: string, enabled = true): PartnerLocationState {
  const [fix, setFix] = useState<RiderPoint | null>(null);
  const [forcedStale, setForcedStale] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const lastRef = useRef<RiderPoint | null>(null);

  useEffect(() => {
    if (!orderId) return;
    void trackOrder(orderId);
    return () => untrackOrder(orderId);
  }, [orderId]);

  useEffect(() => {
    if (enabled) return;
    lastRef.current = null;
    setFix(null);
    setForcedStale(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(timer);
  }, [enabled]);

  const onLocation = useCallback((data: PartnerLocationEvent) => {
    if (!enabled || data.orderId !== orderId) return;
    if (data.status && !riderLocationVisible(data.status)) return;
    const point = readLatLng(data);
    if (!point) return;
    const next: RiderPoint = {
      ...point,
      heading: typeof data.heading === 'number' ? data.heading : undefined,
      accuracy: typeof data.accuracy === 'number' ? data.accuracy : undefined,
      updatedAt: new Date().toISOString(),
      serverAt: data.updatedAt || data.timestamp || data.receivedAt,
    };
    const prev = lastRef.current;
    if (!isNewerServerFix(prev, next)) return;
    lastRef.current = next;
    setForcedStale(false);
    setFix(next);
  }, [enabled, orderId]);

  const onStale = useCallback((data: { orderId: string }) => {
    if (data.orderId !== orderId) return;
    setForcedStale(true);
  }, [orderId]);

  useSocketEvent('partner:location', onLocation);
  useSocketEvent('tracking:location', onLocation);
  useSocketEvent('tracking:stale', onStale);

  return { fix, stale: isFixStale(fix?.updatedAt, now, forcedStale) };
}
