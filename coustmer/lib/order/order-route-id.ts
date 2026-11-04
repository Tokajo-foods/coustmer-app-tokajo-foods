import type { Order } from '@/lib/order/types';

/** Mongo id (or API `id`) used in `/orders/[orderId]/*` routes — never orderNumber. */
export function resolveOrderRouteId(
  order: Pick<Order, 'id' | 'raw'> | null | undefined,
): string {
  if (!order) return '';
  const direct = String(order.id ?? '').trim();
  if (direct && direct !== 'undefined' && direct !== 'null') return direct;
  const raw = order.raw;
  if (raw && typeof raw === 'object') {
    const fromRaw = String(
      (raw as Record<string, unknown>)._id
        ?? (raw as Record<string, unknown>).id
        ?? (raw as Record<string, unknown>).orderId
        ?? '',
    ).trim();
    if (fromRaw && fromRaw !== 'undefined') return fromRaw;
  }
  return '';
}

export function normalizeOrderIdParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return String(value[0] ?? '').trim();
  return String(value ?? '').trim();
}
