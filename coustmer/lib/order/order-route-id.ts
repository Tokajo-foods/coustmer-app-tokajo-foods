import type { Order } from '@/lib/order/types';

const PLACEHOLDER_IDS = new Set(['[orderId]', '[id]', 'orderId', 'undefined', 'null']);

/** Mongo ObjectId (24 hex) — canonical order route id from order-service. */
export function isValidOrderRouteId(value: string | null | undefined): boolean {
  const id = String(value ?? '').trim();
  if (!id || PLACEHOLDER_IDS.has(id)) return false;
  return /^[a-f\d]{24}$/i.test(id);
}

/** Mongo id (or API `id`) used in `/orders/[orderId]/*` routes — never orderNumber. */
export function resolveOrderRouteId(
  order: Pick<Order, 'id' | 'raw'> | null | undefined,
): string {
  if (!order) return '';
  const direct = String(order.id ?? '').trim();
  if (direct && !PLACEHOLDER_IDS.has(direct)) return direct;
  const raw = order.raw;
  if (raw && typeof raw === 'object') {
    const fromRaw = String(
      (raw as Record<string, unknown>)._id
        ?? (raw as Record<string, unknown>).id
        ?? (raw as Record<string, unknown>).orderId
        ?? '',
    ).trim();
    if (fromRaw && !PLACEHOLDER_IDS.has(fromRaw)) return fromRaw;
  }
  return '';
}

export function normalizeOrderIdParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? String(value[0] ?? '').trim() : String(value ?? '').trim();
  if (!raw || PLACEHOLDER_IDS.has(raw)) return '';
  if (!isValidOrderRouteId(raw)) return '';
  return raw;
}
