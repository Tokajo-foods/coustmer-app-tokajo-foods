import type { TrackingPhase } from '@/lib/order/tracking-phase';
import {
  customerArrivalSecondsRemaining,
  type CustomerArrivalFields,
} from '@/lib/order/customer-arrival-at';

export type EtaSample = { seconds: number; at: number };
export type EtaLabel = { value: string; unit: 'min' | null };

export type OrderArrivalContext = CustomerArrivalFields & {
  orderEstimateIso?: string;
};

/** Newest server ETA, counted down on the device clock since it arrived. */
function remainingSeconds(samples: Array<EtaSample | null>, now: number): number | null {
  let best: EtaSample | null = null;
  for (const s of samples) {
    if (!s || !Number.isFinite(s.seconds) || s.seconds < 0) continue;
    if (!best || s.at > best.at) best = s;
  }
  if (!best) return null;
  return Math.max(0, best.seconds - (now - best.at) / 1000);
}

function minutesLabel(seconds: number): EtaLabel {
  if (seconds < 45) return { value: 'Now', unit: null };
  return { value: String(Math.max(1, Math.ceil(seconds / 60))), unit: 'min' };
}

function etaSampleFromIso(iso?: string | null, now = Date.now()): EtaSample | null {
  if (!iso) return null;
  const atMs = Date.parse(iso);
  if (!Number.isFinite(atMs)) return null;
  const seconds = (atMs - now) / 1000;
  return { seconds: Math.max(0, seconds), at: now };
}

function labelFromSeconds(seconds: number | null): EtaLabel | null {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  if (seconds <= 0) return { value: 'Soon', unit: null };
  return minutesLabel(seconds);
}

function orderArrivalLabel(ctx: OrderArrivalContext | undefined, now: number): EtaLabel | null {
  if (!ctx) return null;
  const dynamicSec = customerArrivalSecondsRemaining(ctx, now);
  const isoSec = ctx.orderEstimateIso
    ? (Date.parse(ctx.orderEstimateIso) - now) / 1000
    : null;
  let bestSec = dynamicSec;
  if (isoSec != null && Number.isFinite(isoSec)) {
    bestSec = bestSec == null ? isoSec : Math.max(bestSec, isoSec);
  }
  return labelFromSeconds(bestSec);
}

/**
 * Before pickup the rider ETA points at the restaurant, so the order's promised time is preferred.
 * After pickup the live rider→home ETA wins. Kitchen prep / delay shifts the order promise automatically.
 */
export function resolveEtaLabel(input: {
  phase: TrackingPhase;
  destination: 'restaurant' | 'customer' | null;
  socketEta: EtaSample | null;
  trackerEta: EtaSample | null;
  trackerEtaAt?: string | null;
  orderArrival?: OrderArrivalContext;
  now?: number;
}): EtaLabel | null {
  const { phase, destination } = input;
  const now = input.now ?? Date.now();
  if (!phase.active || !phase.showEta) return null;

  const trackerIsoSample = etaSampleFromIso(input.trackerEtaAt, now);
  const liveSamples = [input.socketEta, input.trackerEta, trackerIsoSample];

  if (phase.key === 'on_the_way') {
    if (destination === 'customer') {
      const live = remainingSeconds(liveSamples, now);
      if (live != null) return minutesLabel(live);
    }
    return orderArrivalLabel(input.orderArrival, now);
  }

  const orderLabel = orderArrivalLabel(input.orderArrival, now);
  if (orderLabel) return orderLabel;

  if (destination === 'restaurant') {
    const riderLeg = remainingSeconds(liveSamples, now);
    if (riderLeg != null) return minutesLabel(riderLeg);
  }

  return null;
}

export function formatDistance(meters: number | undefined | null): string | null {
  if (typeof meters !== 'number' || !Number.isFinite(meters) || meters < 0) return null;
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
