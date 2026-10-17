const APP_SCHEME = 'fooddeliveryapp';

export type ParsedRestaurantShareLink = {
  restaurantId?: string;
  slug?: string;
  fromShare: boolean;
};

export type RestaurantShareTarget = {
  id: string;
  slug?: string | null;
  name?: string;
};

export type RestaurantShareUrls = {
  /** Best link for messaging (https when configured). */
  primaryUrl: string;
  appUrl: string;
  webUrl: string | null;
  message: string;
};

function webShareBase(): string | null {
  const raw =
    process.env.EXPO_PUBLIC_SHARE_WEB_BASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_APP_WEB_URL?.trim() ||
    '';
  if (!raw || !/^https?:\/\//i.test(raw)) return null;
  return raw.replace(/\/+$/, '');
}

export function buildRestaurantShareUrls(
  restaurant: RestaurantShareTarget
): RestaurantShareUrls {
  const name = restaurant.name?.trim() || 'this restaurant';
  const slug = restaurant.slug?.trim();
  const id = restaurant.id?.trim();

  const appPath = slug
    ? `restaurants/slug/${encodeURIComponent(slug)}`
    : `restaurants/${encodeURIComponent(id)}`;
  const appUrl = `${APP_SCHEME}://${appPath}?share=1`;

  const webBase = webShareBase();
  const webUrl = webBase
    ? slug
      ? `${webBase}/r/${encodeURIComponent(slug)}?share=1`
      : `${webBase}/r/id/${encodeURIComponent(id)}?share=1`
    : null;

  const primaryUrl = webUrl ?? appUrl;
  const message = `Order from ${name} on TOKAJO FOODS:\n${primaryUrl}`;

  return { primaryUrl, appUrl, webUrl, message };
}

function parseShareFlag(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const v = params.get('share');
  return v === '1' || v === 'true' || v === 'yes';
}

/** Parse app / web URLs into a restaurant deep-link target. */
export function parseRestaurantShareUrl(
  rawUrl: string | null | undefined
): ParsedRestaurantShareLink | null {
  if (!rawUrl?.trim()) return null;
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const fromShare = parseShareFlag(url.search);

  const host = url.hostname.toLowerCase();
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (url.protocol === `${APP_SCHEME}:`) {
    const slugMatch = path.match(/^\/restaurants\/slug\/([^/]+)$/i);
    if (slugMatch) {
      return {
        slug: decodeURIComponent(slugMatch[1]),
        fromShare: fromShare || true,
      };
    }
    const idMatch = path.match(/^\/restaurants\/([^/]+)$/i);
    if (idMatch && idMatch[1] !== 'slug') {
      return {
        restaurantId: decodeURIComponent(idMatch[1]),
        fromShare: fromShare || true,
      };
    }
    return null;
  }

  if (url.protocol === 'http:' || url.protocol === 'https:') {
    const rSlug = path.match(/^\/r\/([^/]+)$/i);
    if (rSlug && rSlug[1] !== 'id') {
      return {
        slug: decodeURIComponent(rSlug[1]),
        fromShare: fromShare || true,
      };
    }
    const rId = path.match(/^\/r\/id\/([^/]+)$/i);
    if (rId) {
      return {
        restaurantId: decodeURIComponent(rId[1]),
        fromShare: fromShare || true,
      };
    }
    const webSlug = path.match(/^\/restaurants\/slug\/([^/]+)$/i);
    if (webSlug) {
      return { slug: decodeURIComponent(webSlug[1]), fromShare: fromShare || true };
    }
    const webId = path.match(/^\/restaurants\/([^/]+)$/i);
    if (webId && webId[1] !== 'slug') {
      return {
        restaurantId: decodeURIComponent(webId[1]),
        fromShare: fromShare || true,
      };
    }
  }

  // Expo dev client may pass host-only paths in some builds.
  if (!host || host === 'expo-development-client') {
    const slugMatch = path.match(/^\/restaurants\/slug\/([^/]+)$/i);
    if (slugMatch) {
      return { slug: decodeURIComponent(slugMatch[1]), fromShare: true };
    }
  }

  return null;
}
