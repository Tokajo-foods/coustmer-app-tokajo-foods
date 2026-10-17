import type { Href, Router } from 'expo-router';

/** Canonical navigation into a restaurant menu (avoids unmatched typed routes). */
export function openRestaurantMenu(
  router: Router,
  restaurantId: string,
  options?: {
    slug?: string | null;
    replace?: boolean;
    params?: Record<string, string | undefined>;
  }
) {
  const id = String(restaurantId ?? '').trim();
  const slug = options?.slug?.trim();
  if (!id && !slug) return;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(options?.params ?? {})) {
    if (value != null && String(value).trim()) {
      search.set(key, String(value).trim());
    }
  }
  const qs = search.toString();
  const suffix = qs ? `?${qs}` : '';

  const href = (
    slug
      ? `/restaurants/slug/${encodeURIComponent(slug)}${suffix}`
      : `/restaurants/${encodeURIComponent(id)}${suffix}`
  ) as Href;

  if (options?.replace) router.replace(href);
  else router.push(href);
}
