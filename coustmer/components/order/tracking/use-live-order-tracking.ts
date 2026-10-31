import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { resolveEtaLabel, type EtaSample } from '@/components/order/tracking/tracking-eta';
import { deliveryKeys, useOrderTracking } from '@/lib/delivery/hooks';
import { errorStatus } from '@/lib/delivery/http';
import { fresherRiderPoint, isFixStale, routeLeg, trackingMapVisible } from '@/lib/delivery/rider-fix';
import { useOrder } from '@/lib/order/hooks';
import { resolveTrackingPhase } from '@/lib/order/tracking-phase';
import { isActiveOrderStatus } from '@/lib/order/types';
import { useSocketConnection, useSocketEvent } from '@/lib/socket/hooks';
import { usePartnerLocationSocket } from '@/lib/socket/partner-location';

/** Socket up: REST only refreshes ETA/partner. Socket down: REST is the live path. */
const POLL_TRIP_SOCKET_MS = 30_000;
const POLL_TRIP_FALLBACK_MS = 8_000;
const POLL_NO_TRIP_MS = 15_000;
const POLL_ORDER_SOCKET_MS = 45_000;
const POLL_ORDER_FALLBACK_MS = 12_000;

type Push = { status: string; at: number };

const NO_PARTNER_TRIP = new Set(['assigned', 'cancelled', 'reassigned', 'failed']);

function newer(push: Push | null, restStatus: string | undefined, restAt: number): string | null {
  if (push && (push.at > restAt || !restStatus)) return push.status;
  return restStatus ?? null;
}

export function useLiveOrderTracking(orderId: string) {
  const queryClient = useQueryClient();
  const connection = useSocketConnection();
  const socketLive = connection === 'connected';
  const activeRef = useRef(true);
  const socketLiveRef = useRef(socketLive);
  socketLiveRef.current = socketLive;

  const order = useOrder(orderId, {
    refetchInterval: (q) => {
      if (!isActiveOrderStatus(q.state.data?.status) || !activeRef.current) return false;
      return socketLiveRef.current ? POLL_ORDER_SOCKET_MS : POLL_ORDER_FALLBACK_MS;
    },
  });
  const tracking = useOrderTracking(orderId, {
    refetchInterval: (q) => {
      if (!activeRef.current) return false;
      if (!q.state.data) return POLL_NO_TRIP_MS;
      return socketLiveRef.current ? POLL_TRIP_SOCKET_MS : POLL_TRIP_FALLBACK_MS;
    },
  });
  const o = order.data;
  const t = tracking.data;
  const noTripYet = errorStatus(tracking.error) === 404;

  const [orderPush, setOrderPush] = useState<Push | null>(null);
  const [tripPush, setTripPush] = useState<Push | null>(null);
  const [socketEta, setSocketEta] = useState<EtaSample | null>(null);

  const refetchTracking = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: deliveryKeys.tracking(orderId) });
  }, [orderId, queryClient]);
  const refetchOrder = order.refetch;
  const refetchAll = useCallback(() => {
    void refetchOrder();
    refetchTracking();
  }, [refetchOrder, refetchTracking]);

  useSocketEvent('order:status', (d) => {
    if (d.orderId !== orderId) return;
    setOrderPush({ status: d.status, at: Date.now() });
    refetchAll();
  }, [orderId]);
  useSocketEvent('order:cancelled', (d) => {
    if (d.orderId !== orderId) return;
    setOrderPush({ status: 'cancelled', at: Date.now() });
    void refetchOrder();
  }, [orderId]);
  useSocketEvent('delivery:assigned', (d) => {
    if (d.orderId === orderId) refetchTracking();
  }, [orderId]);
  useSocketEvent('delivery:status', (d) => {
    if (d.orderId !== orderId) return;
    setTripPush({ status: d.status, at: Date.now() });
    refetchTracking();
    void queryClient.invalidateQueries({ queryKey: deliveryKeys.dropOtp(orderId) });
    if (['delivered', 'returned', 'cancelled', 'returning_to_restaurant'].includes(d.status)) void refetchOrder();
  }, [orderId]);
  useSocketEvent('tracking:eta', (d) => {
    if (d.orderId !== orderId || typeof d.etaSeconds !== 'number') return;
    setSocketEta({ seconds: d.etaSeconds, at: Date.now() });
  }, [orderId]);

  const orderStatus = newer(orderPush, o?.status, order.dataUpdatedAt);
  const tripStatus = noTripYet && !tripPush ? null : newer(tripPush, t?.status, tracking.dataUpdatedAt);
  const phase = resolveTrackingPhase(orderStatus ?? (orderId ? 'placed' : null), tripStatus);
  activeRef.current = phase.active;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && activeRef.current) refetchAll();
    });
    return () => sub.remove();
  }, [refetchAll]);

  useEffect(() => {
    if (socketLive && activeRef.current) refetchTracking();
  }, [socketLive, refetchTracking]);

  const riderVisible = phase.active && trackingMapVisible(tripStatus);
  const socketLocation = usePartnerLocationSocket(orderId, riderVisible);
  const polledFix = riderVisible && t?.rider ? t.rider : null;
  const riderFix = riderVisible ? fresherRiderPoint(socketLocation.fix, polledFix) : null;
  const forcedStale = socketLocation.stale && riderFix != null && riderFix === socketLocation.fix;
  const riderStale = riderFix ? isFixStale(riderFix.updatedAt, Date.now(), forcedStale) : false;

  const partner = t?.partner && tripStatus && !NO_PARTNER_TRIP.has(tripStatus) ? t.partner : null;
  const destination = t?.destination ?? null;
  const eta = resolveEtaLabel({
    phase,
    destination,
    socketEta,
    trackerEta: typeof t?.etaSeconds === 'number' ? { seconds: t.etaSeconds, at: tracking.dataUpdatedAt } : null,
    orderEstimateIso: o?.estimatedDeliveryAt,
  });

  return {
    order,
    tracking,
    o,
    t,
    phase,
    orderStatus,
    tripStatus,
    socketLive,
    riderVisible,
    mapLeg: routeLeg(tripStatus) ?? 'restaurant',
    riderFix,
    riderStale,
    partner,
    eta,
    distanceMeters: destination === 'customer' && phase.showEta ? t?.distanceMeters : undefined,
    trackingForbidden: errorStatus(tracking.error) === 403,
    refetchAll,
  };
}

export type LiveOrderTracking = ReturnType<typeof useLiveOrderTracking>;
