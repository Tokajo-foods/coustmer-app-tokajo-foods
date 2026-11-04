import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { customerArrivalAtMs, CUSTOMER_LAST_MILE_MINUTES } from './customer-arrival-at';

describe('customerArrivalAtMs', () => {
  const created = '2026-01-01T10:00:00.000Z';
  const now = Date.parse('2026-01-01T10:05:00.000Z');

  it('uses checkout promise minutes from createdAt', () => {
    const ms = customerArrivalAtMs({
      status: 'placed',
      createdAt: created,
      estimatedDeliveryTime: 35,
      nowMs: now,
    });
    assert.equal(ms, Date.parse('2026-01-01T10:35:00.000Z'));
  });

  it('extends past checkout when kitchen sets a later promisedReadyAt', () => {
    const ms = customerArrivalAtMs({
      status: 'preparing',
      createdAt: created,
      estimatedDeliveryTime: 35,
      promisedReadyAt: '2026-01-01T10:40:00.000Z',
      nowMs: now,
    });
    assert.equal(
      ms,
      Date.parse('2026-01-01T10:40:00.000Z') + CUSTOMER_LAST_MILE_MINUTES * 60_000,
    );
  });

  it('pushes arrival forward while prep is overdue', () => {
    const ms = customerArrivalAtMs({
      status: 'preparing',
      promisedReadyAt: '2026-01-01T10:00:00.000Z',
      nowMs: Date.parse('2026-01-01T10:20:00.000Z'),
    });
    assert.equal(
      ms,
      Date.parse('2026-01-01T10:20:00.000Z') + CUSTOMER_LAST_MILE_MINUTES * 60_000,
    );
  });
});
