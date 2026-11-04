function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function isOrderDocument(record: Record<string, unknown>): boolean {
  return Boolean(record._id || record.id || record.orderNumber || record.orderNo);
}

/**
 * Rows from GET /orders/active `data`.
 * Must not use generic list extractors that treat order line `items` as a list.
 */
export function rawActiveOrderRows(data: unknown): Record<string, unknown>[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data.map(asRecord);

  const record = asRecord(data);
  if (isOrderDocument(record)) return [record];

  for (const key of ['orders', 'activeOrders', 'active'] as const) {
    const batch = record[key];
    if (Array.isArray(batch) && batch.length) {
      return batch.map(asRecord);
    }
  }

  const nested = record.data;
  if (nested != null && nested !== data) {
    return rawActiveOrderRows(nested);
  }

  return [];
}
