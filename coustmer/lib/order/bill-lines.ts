import type { OrderBillLine } from '@/lib/order/types';

/** Map order-service `bill.customer.lines` as-is (amounts are already final). */
export function mapOrderBillLines(raw: unknown): OrderBillLine[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const lines: OrderBillLine[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const amount = Number(r.amount);
    if (!Number.isFinite(amount)) continue;
    lines.push({
      key: String(r.key ?? ''),
      label: String(r.label ?? ''),
      amount,
      sign: r.sign === 'subtract' ? 'subtract' : 'add',
    });
  }
  return lines.length ? lines : undefined;
}
