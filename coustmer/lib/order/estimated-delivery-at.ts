/** Resolve a wall-clock delivery estimate from order-service fields. */

function pickNum(...values: unknown[]): number | undefined {
  for (const v of values) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function isoIfValid(v: unknown): string | undefined {
  if (typeof v !== 'string' || !v.trim()) return undefined;
  const ms = Date.parse(v);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : undefined;
}

function minutesFromCreated(createdAt: unknown, minutes: number): string | undefined {
  const base =
    typeof createdAt === 'string'
      ? Date.parse(createdAt)
      : createdAt instanceof Date
        ? createdAt.getTime()
        : NaN;
  if (!Number.isFinite(base) || minutes <= 0) return undefined;
  return new Date(base + minutes * 60_000).toISOString();
}

/**
 * order-service stores checkout promise as `estimatedDeliveryTime` (minutes).
 * Delivery route recalc may store an absolute time on the delivery doc — mirror as ISO when present.
 */
export function resolveEstimatedDeliveryAtIso(data: Record<string, unknown>): string | undefined {
  const fromApi = isoIfValid(data.estimatedDeliveryAt) ?? isoIfValid(data.deliveryEtaAt);
  if (fromApi) return fromApi;

  const etaIso = isoIfValid(data.eta);
  if (etaIso) return etaIso;

  const raw = data.estimatedDeliveryTime;
  if (raw instanceof Date && Number.isFinite(raw.getTime())) {
    return raw.toISOString();
  }
  if (typeof raw === 'string') {
    const asIso = isoIfValid(raw);
    if (asIso) return asIso;
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (raw > 1_000_000_000_000) return new Date(raw).toISOString();
    if (raw > 0 && raw < 720) {
      return minutesFromCreated(data.createdAt ?? data.placedAt, raw);
    }
  }

  const promiseMinutes = pickNum(data.promiseMinutes, data.estimatedDeliveryMinutes);
  if (promiseMinutes != null && promiseMinutes > 0 && promiseMinutes < 720) {
    return minutesFromCreated(data.createdAt ?? data.placedAt, promiseMinutes);
  }

  return undefined;
}
