/** True when a URL might be a restaurant share/deep link (ignore bare app scheme / Metro root). */
export function isRestaurantShareUrl(raw: string | null | undefined): boolean {
  const normalized = unwrapExpoDevLinkUrl(raw);
  if (!normalized) return false;

  const lower = normalized.toLowerCase();
  if (lower === 'fooddeliveryapp:///' || lower === 'fooddeliveryapp://') return false;

  return (
    /\/restaurants\/(slug\/[^/?#]+|[^/?#]+)/i.test(normalized) ||
    /\/r\/(id\/[^/?#]+|[^/?#]+)/i.test(normalized) ||
    /fooddeliveryapp:\/\/restaurants\//i.test(normalized)
  );
}

/** Expo dev client wraps the real path in `?url=` (ignore for normal in-app taps). */
export function unwrapExpoDevLinkUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  let candidate = raw.trim();

  try {
    const u = new URL(candidate);
    const nested = u.searchParams.get('url');
    if (nested) {
      try {
        candidate = decodeURIComponent(nested);
      } catch {
        candidate = nested;
      }
    }
  } catch {
    // keep raw string
  }

  return candidate;
}
