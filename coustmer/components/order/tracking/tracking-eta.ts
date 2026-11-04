import type { TrackingPhase } from '@/lib/order/tracking-phase';

export type EtaSample = { seconds: number; at: number };
export type EtaLabel = { value: string; unit: 'min' | null };

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

function labelFromOrderEstimate(iso: string | undefined, now: number): EtaLabel | null {
  if (!iso) return null;
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return null;
  const seconds = (at - now) / 1000;
  return seconds > 0 ? minutesLabel(seconds) : { value: 'Soon', unit: null };
}

/**
 * Before pickup the rider ETA points at the restaurant, so the order's promised time is preferred.
 * After pickup the live rider→home ETA wins. Falls back to order promise when GPS ETA is not ready yet.
 */
export function resolveEtaLabel(input: {
  phase: TrackingPhase;
  destination: 'restaurant' | 'customer' | null;
  socketEta: EtaSample | null;
  trackerEta: EtaSample | null;
  trackerEtaAt?: string | null;
  orderEstimateIso?: string;
  now?: number;
}): EtaLabel | null {
  const { phase, destination } = input;
  const now = input.now ?? Date.now();
  if (!phase.active || !phase.showEta) return null;

  const trackerIsoSample = etaSampleFromIso(input.trackerEtaAt, now);
  const liveSamples = [input.socketEta, input.trackerEta, trackerIsoSample];

  if (phase.key === 'on_the_way') {
    const live = remainingSeconds(
      destination === 'customer' ? liveSamples : [input.socketEta, input.trackerEta, trackerIsoSample],
      now,
    );
    if (live != null) return minutesLabel(live);
    return labelFromOrderEstimate(input.orderEstimateIso, now);
  }

  const orderLabel = labelFromOrderEstimate(input.orderEstimateIso, now);
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
