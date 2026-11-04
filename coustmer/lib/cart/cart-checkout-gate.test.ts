import { describe, expect, it } from 'vitest';

import { resolveCartCheckoutBlock } from '@/lib/cart/cart-checkout-gate';

describe('resolveCartCheckoutBlock', () => {
  it('blocks delivery when pin is outside restaurant radius', () => {
    const block = resolveCartCheckoutBlock({
      itemCount: 2,
      deliveryType: 'delivery',
      rangeMessage: null,
      billPin: { lat: 28.7, lng: 77.2 },
      outlet: { lat: 28.6, lng: 77.1, maxDeliveryRadius: 3 },
      priceReady: false,
    });
    expect(block?.title).toBe('Out of delivery range');
    expect(block?.changeAddress).toBe(true);
    expect(block?.message).toMatch(/within 3 km/i);
  });
});
