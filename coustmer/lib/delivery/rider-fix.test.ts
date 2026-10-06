import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isFixStale,
  readLatLng,
  riderLocationVisible,
  routeLeg,
  trackingMapVisible,
} from './rider-fix';

describe('rider location visibility', () => {
  it('hides the map until the rider accepts, then routes to the store and then home', () => {
    assert.equal(trackingMapVisible(undefined), false);
    assert.equal(trackingMapVisible('preparing'), false);
    assert.equal(trackingMapVisible('ready'), false);
    assert.equal(trackingMapVisible('assigned'), false);
    assert.equal(riderLocationVisible('accepted'), true);
    assert.equal(routeLeg('accepted'), 'restaurant');
    assert.equal(routeLeg('arrived_at_restaurant'), 'restaurant');
    assert.equal(routeLeg('returning_to_restaurant'), 'restaurant');
    assert.equal(routeLeg('picked_up'), 'home');
    assert.equal(routeLeg('out_for_delivery'), 'home');
    assert.equal(routeLeg('arrived_at_customer'), 'home');
    assert.equal(trackingMapVisible('delivered'), false);
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
