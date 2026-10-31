import { canonicalPayChoice } from '@/lib/checkout/payment-display';
import { parseDeliveryAddress } from '@/lib/order/parse-address';
import type { CreateOrderPayload } from '@/lib/order/types';
import type { CartItem } from '@/store/cart-store';
import type { DeliveryLocation } from '@/store/delivery-location-store';

/** Cart choice → order-service method. Pay online is one Razorpay checkout (UPI, cards, banks). */
export function resolveCheckoutMethod(choice: string): { method: string } {
  const pay = canonicalPayChoice(choice);
  return { method: pay === 'online' ? 'upi' : pay };
}

type BuildInput = {
  restaurant: { id: string; name: string };
  items: CartItem[];
  location: DeliveryLocation | null;
  isTakeaway: boolean;
  deliveryType: string;
  paymentMethod: string;
  contactName: string;
  contactPhone: string;
  specialInstructions?: string | null;
  tip: number;
  scheduledFor?: string | null;
};

/** POST /orders body for the checkout screen. */
export function buildCheckoutOrder(input: BuildInput): CreateOrderPayload {
  const { location, isTakeaway } = input;
  const address = isTakeaway || !location
    ? {
        label: 'Takeaway',
        formattedAddress: input.restaurant.name,
        street: '',
        area: '',
        city: location?.city || 'City',
        state: 'State',
        pincode: '000000',
        lat: location?.lat,
        lng: location?.lng,
      }
    : parseDeliveryAddress({
        formattedAddress: location.formattedAddress,
        label: location.label,
        city: location.city,
        lat: location.lat,
        lng: location.lng,
      });
  const tip = !isTakeaway && input.tip > 0 ? input.tip : 0;

  return {
    restaurantId: input.restaurant.id,
    restaurantName: input.restaurant.name,
    items: input.items.map((item) => ({
      menuItemId: item.menuItemId || item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      specialInstructions: item.specialInstructions,
    })),
    deliveryAddress: {
      label: address.label,
      formattedAddress: address.formattedAddress,
      street: address.street,
      area: address.area,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      lat: address.lat,
      lng: address.lng,
    },
    addressId: location?.savedAddressId,
    paymentMethod: input.paymentMethod,
    deliveryType: input.deliveryType,
    fulfillmentType: input.deliveryType,
    specialInstructions: input.specialInstructions || undefined,
    tip,
    deliveryTip: tip,
    scheduledFor: input.scheduledFor ?? undefined,
    isScheduled: Boolean(input.scheduledFor),
  };
}
