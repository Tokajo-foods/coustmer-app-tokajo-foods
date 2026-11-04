import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { orderIsTrackable, isTrackableOrderStatus } from './trackable-order';
import type { Order } from './types';

describe('orderIsTrackable', () => {
  const base = { id: '674a1b2c3d4e5f6789012345', status: 'preparing', items: [] } as Order;

  it('rejects delivered and cancelled statuses', () => {
    assert.equal(orderIsTrackable({ ...base, status: 'delivered' }), false);
    assert.equal(orderIsTrackable({ ...base, status: 'cancelled' }), false);
    assert.equal(orderIsTrackable({ ...base, status: 'completed' }), false);
    assert.equal(isTrackableOrderStatus('canceled'), false);
  });

  it('rejects when terminal timestamps exist even if status is stale', () => {
    assert.equal(
      orderIsTrackable({
        ...base,
        status: 'preparing',
        deliveredAt: '2026-01-01T12:00:00.000Z',
      }),
      false,
    );
    assert.equal(
      orderIsTrackable({
        ...base,
        status: 'out_for_delivery',
        cancelledAt: '2026-01-01T12:00:00.000Z',
      }),
      false,
    );
  });

  it('allows in-flight kitchen and delivery statuses', () => {
    assert.equal(orderIsTrackable({ ...base, status: 'preparing' }), true);
    assert.equal(orderIsTrackable({ ...base, status: 'out_for_delivery' }), true);
  });
});
