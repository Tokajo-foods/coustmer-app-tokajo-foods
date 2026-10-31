import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveTrackingPhase } from './tracking-phase';

describe('resolveTrackingPhase', () => {
  it('keeps the kitchen phase while the rider heads to the restaurant', () => {
    const p = resolveTrackingPhase('preparing', 'accepted');
    assert.equal(p.key, 'preparing');
    assert.equal(p.step, 'preparing');
    assert.match(p.hint, /on the way to the restaurant/);
    assert.equal(resolveTrackingPhase('ready', 'arrived_at_restaurant').key, 'ready');
  });

  it('moves to on the way from pickup, and to the door on arrival', () => {
    assert.equal(resolveTrackingPhase('ready', 'picked_up').key, 'on_the_way');
    assert.equal(resolveTrackingPhase('out_for_delivery', null).key, 'on_the_way');
    const door = resolveTrackingPhase('out_for_delivery', 'arrived_at_customer');
    assert.equal(door.key, 'at_door');
    assert.equal(door.showEta, false);
  });

  it('handles RTO without an arrival ETA', () => {
    const back = resolveTrackingPhase('out_for_delivery', 'returning_to_restaurant');
    assert.equal(back.key, 'returning');
    assert.equal(back.active, true);
    assert.equal(back.showEta, false);
    const done = resolveTrackingPhase('cancelled', 'returned');
    assert.equal(done.key, 'returned');
    assert.equal(done.active, false);
  });

  it('ends tracking on delivered or cancelled', () => {
    assert.equal(resolveTrackingPhase('out_for_delivery', 'delivered').completed, true);
    assert.equal(resolveTrackingPhase('cancelled', 'accepted').active, false);
    assert.equal(resolveTrackingPhase('placed', null).key, 'placed');
  });

  it('uses kitchen-only copy for takeaway', () => {
    const ready = resolveTrackingPhase('ready', 'assigned', { pickup: true });
    assert.equal(ready.key, 'ready');
    assert.equal(ready.step, 'ready');
    assert.match(ready.hint, /restaurant counter/);
    assert.equal(ready.showEta, false);
    const done = resolveTrackingPhase('delivered', 'delivered', { pickup: true });
    assert.equal(done.title, 'Picked up');
    assert.equal(done.completed, true);
    const prep = resolveTrackingPhase('preparing', 'accepted', { pickup: true });
    assert.doesNotMatch(prep.hint, /delivery partner/);
  });
});
