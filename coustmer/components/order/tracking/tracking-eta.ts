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

/**
 * Before pickup the rider ETA points at the restaurant, so the order's promised time is used.
 * After pickup the live rider→home ETA wins. No server number means no ETA, never a guess.
 */
export function resolveEtaLabel(input: {
  phase: TrackingPhase;
  destination: 'restaurant' | 'customer' | null;
  socketEta: EtaSample | null;
  trackerEta: EtaSample | null;
  orderEstimateIso?: string;
  now?: number;
}): EtaLabel | null {
  const { phase, destination } = input;
  const now = input.now ?? Date.now();
  if (!phase.active || !phase.showEta) return null;

  if (phase.key === 'on_the_way') {
    const live = remainingSeconds(
      [input.socketEta, destination === 'customer' ? input.trackerEta : null],
      now,
    );
    if (live != null) return minutesLabel(live);
  }

  if (input.orderEstimateIso) {
    const at = Date.parse(input.orderEstimateIso);
    if (Number.isFinite(at)) {
      const seconds = (at - now) / 1000;
      return seconds > 0 ? minutesLabel(seconds) : { value: 'Soon', unit: null };
    }
  }
  return null;
}

export function formatDistance(meters: number | undefined | null): string | null {
  if (typeof meters !== 'number' || !Number.isFinite(meters) || meters < 0) return null;
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
