/** Kitchen takeaway / self-pickup (order-service `deliveryType: pickup`). */
export function isPickupOrder(order?: {
  deliveryType?: string | null;
  fulfillmentType?: string | null;
  raw?: Record<string, unknown> | null;
} | null): boolean {
  const raw = order?.raw ?? {};
  const value = String(
    order?.deliveryType ??
      order?.fulfillmentType ??
      raw.deliveryType ??
      raw.fulfillmentType ??
      raw.orderType ??
      ''
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  return value === 'pickup' || value === 'takeaway' || value === 'take_away' || value === 'self_pickup';
}
