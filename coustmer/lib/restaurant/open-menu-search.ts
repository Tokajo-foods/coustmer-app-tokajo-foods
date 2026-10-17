import type { Href, Router } from 'expo-router';

export function openRestaurantMenuSearch(
  router: Router,
  restaurantId: string,
  restaurantName?: string
) {
  const id = String(restaurantId ?? '').trim();
  if (!id) return;

  const qs = new URLSearchParams();
  const name = restaurantName?.trim();
  if (name) qs.set('name', name);

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  router.push(`/restaurants/${encodeURIComponent(id)}/menu-search${suffix}` as Href);
}
