/** Offer amount when the kitchen set a discounted price below the list price. */
export function offerPriceOf(item: {
  price: number;
  discountedPrice?: number | null;
}): number | undefined {
  const offer = item.discountedPrice;
  if (typeof offer !== 'number' || !Number.isFinite(offer)) return undefined;
  if (offer <= 0 || offer >= item.price) return undefined;
  return offer;
}

/** Amount the customer pays for the dish (offer if valid, else list price). */
export function payPriceOf(item: {
  price: number;
  discountedPrice?: number | null;
}): number {
  return offerPriceOf(item) ?? item.price;
}
