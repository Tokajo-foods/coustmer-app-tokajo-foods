import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveEstimatedDeliveryAtIso } from './estimated-delivery-at';

describe('resolveEstimatedDeliveryAtIso', () => {
  it('turns checkout promise minutes into ISO from createdAt', () => {
    const iso = resolveEstimatedDeliveryAtIso({
      createdAt: '2026-01-01T10:00:00.000Z',
      estimatedDeliveryTime: 35,
    });
    assert.equal(iso, '2026-01-01T10:35:00.000Z');
  });

  it('prefers explicit estimatedDeliveryAt from the API', () => {
    const iso = resolveEstimatedDeliveryAtIso({
      estimatedDeliveryAt: '2026-01-01T11:00:00.000Z',
      estimatedDeliveryTime: 10,
      createdAt: '2026-01-01T10:00:00.000Z',
    });
    assert.equal(iso, '2026-01-01T11:00:00.000Z');
  });

  it('extends checkout ETA when kitchen sets a later promisedReadyAt', () => {
    const iso = resolveEstimatedDeliveryAtIso({
      status: 'preparing',
      createdAt: '2026-01-01T10:00:00.000Z',
      estimatedDeliveryTime: 30,
      promisedReadyAt: '2026-01-01T10:40:00.000Z',
    });
    assert.equal(iso, '2026-01-01T10:52:00.000Z');
  });
});
