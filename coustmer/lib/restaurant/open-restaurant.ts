import type { Href, Router } from 'expo-router';

type OpenOptions = {
  /** Use slug route only for fulfilled share links — not for in-app card taps. */
  useSlugRoute?: boolean;
  slug?: string | null;
  replace?: boolean;
  params?: Record<string, string | undefined>;
};

function buildRestaurantHref(
  restaurantId: string,
  options?: OpenOptions
): Href | null {
  const id = String(restaurantId ?? '').trim();
  const slug =
    options?.useSlugRoute && options.slug?.trim()
      ? options.slug.trim()
      : undefined;

  const extra: Record<string, string> = {};
  for (const [key, value] of Object.entries(options?.params ?? {})) {
    if (value != null && String(value).trim()) {
      extra[key] = String(value).trim();
    }
  }

  if (slug) {
    return {
      pathname: '/restaurants/slug/[slug]',
      params: { slug, ...extra },
    } as Href;
  }

  if (!id) return null;

  return {
    pathname: '/restaurants/[restaurantId]',
    params: { restaurantId: id, ...extra },
  } as Href;
}

/** Canonical navigation into a restaurant menu screen. */
export function openRestaurantMenu(
  router: Router,
  restaurantId: string,
  options?: OpenOptions
) {
  const href = buildRestaurantHref(restaurantId, options);
  if (!href) return;

  if (options?.replace) router.replace(href);
  else router.push(href);
}

export function restaurantMenuHref(
  restaurantId: string,
  options?: OpenOptions
): Href | null {
  return buildRestaurantHref(restaurantId, options);
}
