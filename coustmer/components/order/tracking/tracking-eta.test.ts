import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveTrackingPhase } from '../../../lib/order/tracking-phase';
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
      orderEstimateIso: new Date(NOW + 25 * 60_000).toISOString(),
      now: NOW,
    });
    assert.deepEqual(label, { value: '25', unit: 'min' });
  });

  it('never guesses: no server number means no ETA, a passed estimate means soon', () => {
    const phase = resolveTrackingPhase('preparing', null);
    assert.equal(resolveEtaLabel({ phase, destination: null, socketEta: null, trackerEta: null, now: NOW }), null);
    const late = resolveEtaLabel({
      phase,
      destination: null,
      socketEta: null,
      trackerEta: null,
      orderEstimateIso: new Date(NOW - 60_000).toISOString(),
      now: NOW,
    });
    assert.deepEqual(late, { value: 'Soon', unit: null });
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
