/**
 * Customer delivery countdown — same commitment as cart checkout / restaurant listing range.
 * Matches restaurant-service DELIVERY_ETA (prep + travel + buffer, ±5 min label).
 */
/** Minutes after food is ready for pickup handover + ride to customer (no live GPS). */
export const CUSTOMER_LAST_MILE_MINUTES = 12;
/** Same as restaurant-service DELIVERY_ETA.RANGE_PAD_MINUTES — banner "30–40" → max 40. */
export const LISTING_ETA_RANGE_PAD_MINUTES = 5;
/** When no order promise is stored: fallback prep 20 + buffer 3 + range pad 5. */
export const LISTING_PROMISE_MAX_MINUTES = 28;

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
  promiseMaxMinutes?: number;
  /** Frozen at place-order from checkout quote (preferred anchor). */
  estimatedDeliveryAt?: unknown;
  promisedReadyAt?: unknown;
  estimatedPrepTime?: number | null;
  acceptedAt?: unknown;
  readyAt?: unknown;
  nowMs?: number;
};

function pickMinutes(...values: unknown[]): number | null {
  for (const v of values) {
    if (typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 720) return Math.round(v);
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0 && n < 720) return Math.round(n);
    }
  }
  return null;
}

/** Minutes promised to the customer at checkout (upper bound of listing range when available). */
export function checkoutCommitmentMinutes(input: CustomerArrivalFields): number {
  const max = pickMinutes(input.promiseMaxMinutes);
  if (max != null) return max;
  const mid = pickMinutes(input.promiseMinutes, input.estimatedDeliveryTime);
  if (mid != null) return mid;
  return LISTING_PROMISE_MAX_MINUTES;
}

function checkoutWallMs(input: CustomerArrivalFields): number | null {
  const frozen = parseMs(input.estimatedDeliveryAt);
  if (frozen != null) return frozen;
  const createdMs = parseMs(input.createdAt);
  if (createdMs == null) return null;
  return createdMs + checkoutCommitmentMinutes(input) * 60_000;
}

function kitchenAdjustedArrivalMs(
  input: CustomerArrivalFields,
  now: number,
  status: string,
): number | null {
  let foodReadyMs = parseMs(input.promisedReadyAt);
  if (foodReadyMs == null) {
    const acceptedMs = parseMs(input.acceptedAt);
    const prep = input.estimatedPrepTime;
    if (acceptedMs != null && typeof prep === 'number' && prep > 0) {
      foodReadyMs = acceptedMs + prep * 60_000;
    }
  }
  if (foodReadyMs == null) return null;

  let arrival = foodReadyMs + CUSTOMER_LAST_MILE_MINUTES * 60_000;
  if (
    now > foodReadyMs
    && (status === 'accepted' || status === 'preparing')
  ) {
    arrival = Math.max(arrival, now + CUSTOMER_LAST_MILE_MINUTES * 60_000);
  }

  if (status === 'ready') {
    const readyWall = parseMs(input.readyAt) ?? foodReadyMs;
    if (readyWall != null) {
      arrival = Math.max(arrival, Math.max(readyWall, now) + CUSTOMER_LAST_MILE_MINUTES * 60_000);
    } else {
      arrival = Math.max(arrival, now + CUSTOMER_LAST_MILE_MINUTES * 60_000);
    }
  }
  return arrival;
}

/** Wall-clock customer arrival for tracking (checkout promise, then kitchen / rider adjustments). */
export function customerArrivalAtMs(input: CustomerArrivalFields): number | null {
  const now = input.nowMs ?? Date.now();
  const status = String(input.status ?? '').trim().toLowerCase();
  const checkoutAt = checkoutWallMs(input);

  const awaitingKitchen =
    status === 'placed'
    || status === 'pending_payment'
    || status === 'pending'
    || ((status === 'accepted' || status === 'confirmed') && !parseMs(input.promisedReadyAt));

  if (awaitingKitchen) {
    if (checkoutAt != null) return checkoutAt;
    return now + checkoutCommitmentMinutes(input) * 60_000;
  }

  const kitchenAt = kitchenAdjustedArrivalMs(input, now, status);
  if (checkoutAt != null && kitchenAt != null) return Math.max(checkoutAt, kitchenAt);
  if (kitchenAt != null) return kitchenAt;
  if (checkoutAt != null) return checkoutAt;
  return now + checkoutCommitmentMinutes(input) * 60_000;
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
 * Prefers kitchen-adjusted arrival over a stale checkout-only ISO when prep slips.
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
  const promiseMaxMinutes = pickNum(data.promiseMaxMinutes);

  const dynamic = customerArrivalAtIso({
    status: String(data.status ?? ''),
    createdAt: data.createdAt ?? data.placedAt,
    estimatedDeliveryTime: data.estimatedDeliveryTime,
    promiseMinutes,
    promiseMaxMinutes,
    estimatedDeliveryAt: data.estimatedDeliveryAt ?? data.deliveryEtaAt,
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

  if (promiseMinutes != null && promiseMinutes > 0) {
    return customerArrivalAtIso({
      status: String(data.status ?? ''),
      createdAt: data.createdAt ?? data.placedAt,
      promiseMinutes,
      promiseMaxMinutes,
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
