/** Minutes after food is ready for pickup handover + ride to customer (no live GPS). */
export const CUSTOMER_LAST_MILE_MINUTES = 12;
/** Menu/checkout default when the order doc has no promise minutes yet. */
export const DEFAULT_ARRIVAL_PROMISE_MINUTES = 40;
/** Cushion on tracking while the kitchen has not accepted (`placed`). */
export const RESTAURANT_ACCEPT_ETA_MINUTES = 8;

function parseMs(v: unknown): number | null {
  if (v instanceof Date && Number.isFinite(v.getTime())) return v.getTime();
  if (typeof v === 'string' && v.trim()) {
    const ms = Date.parse(v);
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v > 1_000_000_000_000) return v;
    if (v > 1_000_000_000) return v * 1000;
  }
  if (v && typeof v === 'object' && '$date' in (v as object)) {
    return parseMs((v as { $date: unknown }).$date);
  }
  return null;
}

export type CustomerArrivalFields = {
  status?: string;
  createdAt?: unknown;
  estimatedDeliveryTime?: unknown;
  promiseMinutes?: number;
  promisedReadyAt?: unknown;
  estimatedPrepTime?: number | null;
  acceptedAt?: unknown;
  readyAt?: unknown;
  nowMs?: number;
};

/** Wall-clock customer arrival for tracking (kitchen prep, delays, checkout promise). */
export function customerArrivalAtMs(input: CustomerArrivalFields): number | null {
  const now = input.nowMs ?? Date.now();
  const status = String(input.status ?? '').trim().toLowerCase();

  let checkoutAt: number | null = null;
  const createdMs = parseMs(input.createdAt);
  const promiseMin =
    typeof input.promiseMinutes === 'number' && input.promiseMinutes > 0 && input.promiseMinutes < 720
      ? input.promiseMinutes
      : null;
  const rawPromise = input.estimatedDeliveryTime;
  if (typeof rawPromise === 'number' && Number.isFinite(rawPromise)) {
    if (rawPromise > 1_000_000_000_000) {
      checkoutAt = rawPromise;
    } else if (rawPromise > 0 && rawPromise < 720 && createdMs != null) {
      checkoutAt = createdMs + rawPromise * 60_000;
    }
  } else if (promiseMin != null && createdMs != null) {
    checkoutAt = createdMs + promiseMin * 60_000;
  }

  let foodReadyMs = parseMs(input.promisedReadyAt);
  if (foodReadyMs == null) {
    const acceptedMs = parseMs(input.acceptedAt);
    const prep = input.estimatedPrepTime;
    if (acceptedMs != null && typeof prep === 'number' && prep > 0) {
      foodReadyMs = acceptedMs + prep * 60_000;
    }
  }

  let kitchenArrival: number | null = null;
  if (foodReadyMs != null) {
    kitchenArrival = foodReadyMs + CUSTOMER_LAST_MILE_MINUTES * 60_000;
  }

  if (
    foodReadyMs != null
    && now > foodReadyMs
    && (status === 'accepted' || status === 'preparing')
  ) {
    kitchenArrival = Math.max(kitchenArrival ?? 0, now + CUSTOMER_LAST_MILE_MINUTES * 60_000);
  }

  if (status === 'ready') {
    const readyWall = parseMs(input.readyAt) ?? foodReadyMs;
    if (readyWall != null) {
      kitchenArrival = Math.max(kitchenArrival ?? 0, Math.max(readyWall, now) + CUSTOMER_LAST_MILE_MINUTES * 60_000);
    } else {
      kitchenArrival = Math.max(kitchenArrival ?? 0, now + CUSTOMER_LAST_MILE_MINUTES * 60_000);
    }
  }

  const candidates = [checkoutAt, kitchenArrival].filter(
    (v): v is number => v != null && Number.isFinite(v),
  );

  let totalMin = promiseMin ?? DEFAULT_ARRIVAL_PROMISE_MINUTES;
  if (status === 'placed') {
    totalMin += RESTAURANT_ACCEPT_ETA_MINUTES;
  }
  const baseMs = createdMs ?? now;
  const fallbackAt = baseMs + totalMin * 60_000;
  if (!candidates.length) return fallbackAt;
  return Math.max(...candidates, fallbackAt);
}

export function customerArrivalAtIso(input: CustomerArrivalFields): string | undefined {
  const ms = customerArrivalAtMs(input);
  return ms == null ? undefined : new Date(ms).toISOString();
}

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

/**
 * Map order-service fields to a delivery ETA instant for the customer app.
 * Prefers kitchen-adjusted arrival over a stale checkout-only ISO.
 */
export function resolveEstimatedDeliveryAtIso(data: Record<string, unknown>): string | undefined {
  const promiseMinutes = pickNum(
    data.promiseMinutes,
    data.estimatedDeliveryMinutes,
    typeof data.estimatedDeliveryTime === 'number'
      && data.estimatedDeliveryTime > 0
      && data.estimatedDeliveryTime < 720
      ? data.estimatedDeliveryTime
      : undefined,
  );

  const dynamic = customerArrivalAtIso({
    status: String(data.status ?? ''),
    createdAt: data.createdAt ?? data.placedAt,
    estimatedDeliveryTime: data.estimatedDeliveryTime,
    promiseMinutes,
    promisedReadyAt: data.promisedReadyAt ?? data.promisedAt,
    estimatedPrepTime: pickNum(data.estimatedPrepTime, data.prepMinutes, data.prepTime) ?? null,
    acceptedAt: data.acceptedAt,
    readyAt: data.readyAt,
  });

  const fromApi = isoIfValid(data.estimatedDeliveryAt) ?? isoIfValid(data.deliveryEtaAt);
  if (dynamic && fromApi) {
    const dynamicMs = Date.parse(dynamic);
    const apiMs = Date.parse(fromApi);
    if (Number.isFinite(dynamicMs) && Number.isFinite(apiMs)) {
      return new Date(Math.max(dynamicMs, apiMs)).toISOString();
    }
  }
  if (dynamic) return dynamic;

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
    if (raw > 0 && raw < 720 && promiseMinutes == null) {
      const createdAt = data.createdAt ?? data.placedAt;
      const base = parseMs(createdAt);
      if (base != null) return new Date(base + raw * 60_000).toISOString();
    }
  }

  if (promiseMinutes != null && promiseMinutes > 0) {
    return customerArrivalAtIso({
      status: String(data.status ?? ''),
      createdAt: data.createdAt ?? data.placedAt,
      promiseMinutes,
    });
  }

  return undefined;
}

export function customerArrivalSecondsRemaining(
  fields: CustomerArrivalFields,
  now = Date.now(),
): number | null {
  const atMs = customerArrivalAtMs({ ...fields, nowMs: now });
  if (atMs == null) return null;
  return Math.max(0, (atMs - now) / 1000);
}
