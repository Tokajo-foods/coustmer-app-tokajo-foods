import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { readTrackerPins, resolveTrackingPins } from './tracking-pins';

describe('tracking pins', () => {
  it('reads the delivery-service pickup and drop fields', () => {
    const pins = readTrackerPins({
      pickup: { latitude: 28.5355, longitude: 77.391 },
      drop: { latitude: 28.4744, longitude: 77.503, address: 'Home' },
    });
    assert.equal(pins.restaurantLat, 28.5355);
    assert.equal(pins.restaurantLng, 77.391);
    assert.equal(pins.customerLat, 28.4744);
    assert.equal(pins.customerLng, 77.503);
  });

  it('uses the selected address when the tracker drop is missing', () => {
    const pins = resolveTrackingPins({
      restaurantLat: 28.53,
      restaurantLng: 77.39,
      addressLat: 28.47,
      addressLng: 77.5,
    });
    assert.deepEqual(pins, {
      restLat: 28.53,
      restLng: 77.39,
      custLat: 28.47,
      custLng: 77.5,
    });
  });

  it('does not invent a pin', () => {
    const pins = resolveTrackingPins({});
    assert.equal(pins.custLat, null);
    assert.equal(pins.restLat, null);
  });
});
