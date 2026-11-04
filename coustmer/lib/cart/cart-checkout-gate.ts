import { checkoutBlockCopy } from '@/lib/cart/checkout-block';
import { isRangeError, outsideRestaurantRange } from '@/lib/cart/delivery-range';
import { ongoingOrderMessage } from '@/lib/order/ongoing-order';
import { orderIsTrackable } from '@/lib/order/trackable-order';
import type { Order } from '@/lib/order/types';

export type CartCheckoutBlock = {
  title: string;
  message: string;
  /** Opens delivery location picker from cart. */
  changeAddress?: boolean;
};

type Outlet = {
  lat?: number;
  lng?: number;
  maxDeliveryRadius?: number;
};

type Input = {
  itemCount: number;
  deliveryType: 'delivery' | 'takeaway';
  rangeMessage: string | null;
  billPin: { lat: number; lng: number } | null;
  outlet: Outlet | null | undefined;
  priceReady: boolean;
  billErrorMessage?: string | null;
  billErrorCode?: string | null;
  activeOrder?: Order | null;
};

function rangeBlock(message: string): CartCheckoutBlock {
  return {
    title: 'Out of delivery range',
    message,
    changeAddress: true,
  };
}

/** Why the customer cannot open order summary / checkout yet. */
export function resolveCartCheckoutBlock(input: Input): CartCheckoutBlock | null {
  if (input.itemCount <= 0) {
    return {
      title: 'Cart is empty',
      message: 'Add items from the menu before opening order summary.',
    };
  }

  if (input.activeOrder && orderIsTrackable(input.activeOrder)) {
    return {
      title: 'Order in progress',
      message: ongoingOrderMessage(input.activeOrder),
    };
  }

  if (input.deliveryType === 'delivery' && !input.billPin) {
    return {
      title: 'Add delivery address',
      message: 'Choose where you want this order delivered to continue.',
      changeAddress: true,
    };
  }

  let range = input.rangeMessage?.trim() || null;
  if (!range && input.deliveryType === 'delivery' && input.billPin) {
    range = outsideRestaurantRange(input.outlet, input.billPin);
  }
  if (range) return rangeBlock(range);

  const billMsg = input.billErrorMessage?.trim();
  if (billMsg && isRangeError(billMsg)) {
    return rangeBlock(billMsg);
  }

  if (input.billErrorCode || billMsg) {
    const copy = checkoutBlockCopy(input.billErrorCode ?? undefined, billMsg ?? undefined);
    const changeAddress =
      input.billErrorCode === 'OUT_OF_ZONE' || isRangeError(billMsg);
    return { ...copy, changeAddress: changeAddress || undefined };
  }

  if (!input.priceReady) {
    return {
      title: 'Updating your bill',
      message:
        'We are calculating delivery fee and taxes for your address. Try again in a moment.',
    };
  }

  return null;
}
