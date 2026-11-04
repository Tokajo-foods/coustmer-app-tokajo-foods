import { describe, expect, it } from 'vitest';

import { isOrderDocument, rawActiveOrderRows } from '@/lib/order/active-orders-response';

describe('rawActiveOrderRows', () => {
  const orderId = '674a1b2c3d4e5f6789012345';

  it('returns a single order document (not line items)', () => {
    const payload = {
      _id: orderId,
      status: 'placed',
      orderNumber: 'TK-100',
      items: [{ menuItemId: 'abc', name: 'Biryani', quantity: 1 }],
    };
    const rows = rawActiveOrderRows(payload);
    expect(rows).toHaveLength(1);
    expect(rows[0]?._id).toBe(orderId);
    expect(isOrderDocument(rows[0]!)).toBe(true);
  });

  it('returns empty for null active order', () => {
    expect(rawActiveOrderRows(null)).toEqual([]);
  });
});
