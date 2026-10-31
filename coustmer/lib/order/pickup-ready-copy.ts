function clockLabel(iso?: string | null): string | null {
  if (!iso) return null;
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return null;
  return new Date(at).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function pickupReadyCopy(input: {
  promisedReadyAt?: string | null;
  estimatedPrepTime?: number | null;
  delayMinutes?: number | null;
  ready: boolean;
  now?: number;
}): { label: string; value: string; unit: string | null; sub: string } {
  const now = input.now ?? Date.now();
  const clock = clockLabel(input.promisedReadyAt);
  const prep =
    typeof input.estimatedPrepTime === 'number' && input.estimatedPrepTime > 0
      ? `${input.estimatedPrepTime} min prep`
      : null;
  const delayed =
    typeof input.delayMinutes === 'number' && input.delayMinutes > 0
      ? `+${input.delayMinutes} min delay`
      : null;
  const bits = [prep, delayed, clock ? `Ready by ${clock}` : null].filter(Boolean);

  if (input.ready) {
    return {
      label: 'STATUS',
      value: 'Collect',
      unit: 'now',
      sub: bits.join(' · ') || 'Collect at the restaurant',
    };
  }

  const at = input.promisedReadyAt ? Date.parse(input.promisedReadyAt) : NaN;
  if (Number.isFinite(at)) {
    const minutes = Math.ceil((at - now) / 60_000);
    if (minutes <= 0) {
      return { label: 'READY IN', value: 'Soon', unit: null, sub: bits.join(' · ') || 'Almost ready' };
    }
    return {
      label: 'READY IN',
      value: String(minutes),
      unit: 'min',
      sub: bits.join(' · ') || 'Kitchen timing',
    };
  }

  if (prep) {
    return { label: 'PREP TIME', value: String(input.estimatedPrepTime), unit: 'min', sub: 'Set by the restaurant' };
  }

  return { label: 'ORDER TYPE', value: 'Takeaway', unit: null, sub: 'Waiting for kitchen timing' };
}
