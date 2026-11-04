type Input = {
  deliveryType: 'delivery' | 'takeaway';
  deliveryFee?: number;
  deliveryFeeBase?: number;
  superFreeDelivery?: boolean;
  autoFreeDelivery?: boolean;
  pinLat?: number | null;
  pinLng?: number | null;
  savedLat?: number | null;
  savedLng?: number | null;
  /** A bill response for the current pin has arrived. */
  freshBill?: boolean;
};

function pinMoved(input: Input): boolean {
  if (
    input.pinLat == null ||
    input.pinLng == null ||
    input.savedLat == null ||
    input.savedLng == null
  ) {
    return false;
  }
  return (
    Math.abs(input.pinLat - input.savedLat) > 0.0005 ||
    Math.abs(input.pinLng - input.savedLng) > 0.0005
  );
}

/** True once cart-service has a delivery fee for this drop pin (pickup never waits). */
export function isDeliveryFeeReady(input: Input): boolean {
  if (input.deliveryType === 'takeaway') return true;
  if (input.freshBill) return true;
  const quoted =
    (input.deliveryFee ?? 0) > 0 ||
    input.superFreeDelivery === true ||
    input.autoFreeDelivery === true ||
    typeof input.deliveryFeeBase === 'number';
  return quoted && !pinMoved(input);
}
