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

/**
 * Whole-number % cheaper vs list price. Only when both prices exist
 * and the offer is actually lower. Hidden for a single price or < 1%.
 */
export function discountPercentOf(item: {
  price: number;
  discountedPrice?: number | null;
}): number | undefined {
  const offer = offerPriceOf(item);
  if (offer == null || item.price <= 0) return undefined;
  const pct = Math.round(((item.price - offer) / item.price) * 100);
  if (pct < 1) return undefined;
  return Math.min(pct, 99);
}
