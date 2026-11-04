import type { Href } from 'expo-router';

/** Deep link to live order tracking (concrete path — avoids broken `[orderId]` params). */
export function orderTrackingHref(orderId: string, opts?: { newOrder?: boolean }): Href {
  const id = encodeURIComponent(orderId.trim());
  const q = opts?.newOrder ? '?newOrder=true' : '';
  return `/orders/${id}/tracking${q}` as Href;
}

export function orderDetailHref(orderId: string): Href {
  return `/orders/${encodeURIComponent(orderId.trim())}` as Href;
}
