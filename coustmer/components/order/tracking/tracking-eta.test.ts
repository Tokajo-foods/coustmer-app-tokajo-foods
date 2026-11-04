import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveTrackingPhase } from '../../../lib/order/tracking-phase';
import { customerArrivalSecondsRemaining } from '../../../lib/order/customer-arrival-at';
import { formatDistance, resolveEtaLabel } from './tracking-eta';

const NOW = 1_800_000_000_000;

describe('resolveEtaLabel', () => {
  it('uses the newest live ETA once the rider is heading home, counted down locally', () => {
    const phase = resolveTrackingPhase('out_for_delivery', 'picked_up');
    const label = resolveEtaLabel({
      phase,
      destination: 'customer',
      socketEta: { seconds: 600, at: NOW - 60_000 },
      trackerEta: { seconds: 900, at: NOW - 120_000 },
      now: NOW,
    });
    assert.deepEqual(label, { value: '9', unit: 'min' });
  });

  it('ignores the rider-to-restaurant ETA before pickup and uses the order estimate', () => {
    const phase = resolveTrackingPhase('preparing', 'accepted');
    const label = resolveEtaLabel({
      phase,
      destination: 'restaurant',
      socketEta: { seconds: 120, at: NOW },
      trackerEta: { seconds: 120, at: NOW },
      orderArrival: {
        status: 'preparing',
        createdAt: new Date(NOW - 10 * 60_000).toISOString(),
        promiseMinutes: 40,
        orderEstimateIso: new Date(NOW + 25 * 60_000).toISOString(),
      },
      now: NOW,
    });
    assert.deepEqual(label, { value: '25', unit: 'min' });
  });

  it('extends arrival when kitchen prep runs late', () => {
    const phase = resolveTrackingPhase('preparing', null);
    const promisedReadyAt = new Date(NOW - 5 * 60_000).toISOString();
    const sec = customerArrivalSecondsRemaining(
      { status: 'preparing', promisedReadyAt },
      NOW,
    );
    assert.ok(sec != null && sec >= 12 * 60 - 30);
    const label = resolveEtaLabel({
      phase,
      destination: null,
      socketEta: null,
      trackerEta: null,
      orderArrival: { status: 'preparing', promisedReadyAt },
      now: NOW,
    });
    assert.deepEqual(label, { value: '12', unit: 'min' });
  });

  it('shows soon when the estimate is in the past', () => {
    const phase = resolveTrackingPhase('preparing', null);
    const late = resolveEtaLabel({
      phase,
      destination: null,
      socketEta: null,
      trackerEta: null,
      orderArrival: {
        status: 'preparing',
        orderEstimateIso: new Date(NOW - 60_000).toISOString(),
      },
      now: NOW,
    });
    assert.deepEqual(late, { value: 'Soon', unit: null });
  });

  it('shows arriving estimate while waiting for restaurant accept', () => {
    const phase = resolveTrackingPhase('placed', null);
    const now = Date.parse('2026-01-01T10:05:00.000Z');
    const label = resolveEtaLabel({
      phase,
      destination: null,
      socketEta: null,
      trackerEta: null,
      orderArrival: {
        status: 'placed',
        createdAt: '2026-01-01T10:00:00.000Z',
        promiseMinutes: 35,
        promiseMaxMinutes: 40,
      },
      now,
    });
    assert.deepEqual(label, { value: '35', unit: 'min' });
  });

  it('falls back before order details load', () => {
    const phase = resolveTrackingPhase('placed', null);
    const now = Date.parse('2026-01-01T10:00:00.000Z');
    const label = resolveEtaLabel({
      phase,
      destination: null,
      socketEta: null,
      trackerEta: null,
      now,
    });
    assert.ok(label?.value && label.unit === 'min');
    assert.equal(Number(label.value), 28);
  });

  it('hides the ETA at the door, during a return, and after completion', () => {
    for (const [order, trip] of [
      ['out_for_delivery', 'arrived_at_customer'],
      ['out_for_delivery', 'returning_to_restaurant'],
      ['delivered', 'delivered'],
    ] as const) {
      const phase = resolveTrackingPhase(order, trip);
      const label = resolveEtaLabel({
        phase,
        destination: 'customer',
        socketEta: { seconds: 300, at: NOW },
        trackerEta: null,
        now: NOW,
      });
      assert.equal(label, null, `${order}/${trip}`);
    }
  });
});

describe('formatDistance', () => {
  it('formats metres and kilometres', () => {
    assert.equal(formatDistance(undefined), null);
    assert.equal(formatDistance(234), '230 m');
    assert.equal(formatDistance(2450), '2.5 km');
  });
});
