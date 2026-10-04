import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isFixStale,
  readLatLng,
  riderLocationVisible,
} from './rider-fix';

describe('rider location visibility', () => {
  it('hides the rider until the trip is out for delivery', () => {
    assert.equal(riderLocationVisible(undefined), false);
    assert.equal(riderLocationVisible('preparing'), false);
    assert.equal(riderLocationVisible('ready'), false);
    assert.equal(riderLocationVisible('assigned'), false);
    assert.equal(riderLocationVisible('arrived_at_restaurant'), false);
    assert.equal(riderLocationVisible('picked_up'), true);
    assert.equal(riderLocationVisible('out_for_delivery'), true);
    assert.equal(riderLocationVisible('returning_to_restaurant'), true);
  });
});

describe('readLatLng', () => {
  it('accepts both gateway names and the older short names', () => {
    assert.deepEqual(readLatLng({ latitude: 28.61, longitude: 77.21 }), { lat: 28.61, lng: 77.21 });
    assert.deepEqual(readLatLng({ lat: 28.61, lng: 77.21 }), { lat: 28.61, lng: 77.21 });
    assert.equal(readLatLng({ latitude: 0, longitude: 0 }), null);
  });

  it('marks a fix stale after 45 seconds', () => {
    const now = 100_000;
    assert.equal(isFixStale(new Date(now - 10_000).toISOString(), now), false);
    assert.equal(isFixStale(new Date(now - 50_000).toISOString(), now), true);
    assert.equal(isFixStale(new Date(now).toISOString(), now, true), true);
  });
});
