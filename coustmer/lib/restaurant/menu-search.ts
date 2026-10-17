import type { MenuItem } from '@/lib/restaurant/types';

export type MenuSearchMatch = {
  item: MenuItem;
  score: number;
};

function normalize(text: string): string {
  return String(text ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function haystack(item: MenuItem): string {
  return [
    item.name,
    item.description,
    item.categoryName,
    ...(item.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ');
}

/** Higher score = better match. Zero = no match. */
export function scoreMenuItemMatch(item: MenuItem, rawQuery: string): number {
  const q = normalize(rawQuery);
  if (!q) return 0;

  const name = normalize(item.name ?? '');
  const hay = normalize(haystack(item));
  const qTokens = tokens(q);
  if (!qTokens.length) return 0;

  let score = 0;

  if (name === q) score += 120;
  if (name.startsWith(q)) score += 80;
  if (name.includes(q)) score += 55;

  for (const token of qTokens) {
    if (name === token) score += 40;
    else if (name.startsWith(token)) score += 28;
    else if (name.split(' ').some((w) => w.startsWith(token))) score += 18;
    else if (name.includes(token)) score += 12;
    else if (hay.includes(token)) score += 6;
  }

  if (item.isBestSeller) score += 2;
  if (item.isRecommended) score += 2;

  return score;
}

export function rankMenuSearch(
  items: MenuItem[],
  rawQuery: string,
  options?: { limit?: number; minScore?: number }
): MenuItem[] {
  const limit = options?.limit ?? 24;
  const minScore = options?.minScore ?? 1;
  const q = normalize(rawQuery);

  if (!q) return [];

  const ranked: MenuSearchMatch[] = [];
  for (const item of items) {
    const score = scoreMenuItemMatch(item, q);
    if (score >= minScore) ranked.push({ item, score });
  }

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.item.name ?? '').localeCompare(b.item.name ?? '');
  });

  return ranked.slice(0, limit).map((r) => r.item);
}

export function filterMenuPool(
  items: MenuItem[],
  filters: {
    vegOnly?: boolean;
    menuFilter?: 'all' | 'veg' | 'non_veg' | 'bestsellers' | 'recommended';
  }
): MenuItem[] {
  const { vegOnly, menuFilter = 'all' } = filters;
  let pool = items;

  if (menuFilter === 'veg' || vegOnly) {
    pool = pool.filter((item) => item.isVeg === true);
  } else if (menuFilter === 'non_veg') {
    pool = pool.filter((item) => item.isVeg === false);
  } else if (menuFilter === 'bestsellers') {
    const bestsellers = pool.filter((item) => item.isBestSeller === true);
    pool = bestsellers.length ? bestsellers : pool;
  } else if (menuFilter === 'recommended') {
    const flagged = pool.filter(
      (item) => item.isRecommended === true || item.isBestSeller === true
    );
    pool = flagged.length ? flagged : pool;
  }

  return pool;
}

/** Featured dishes when the search field is focused but empty. */
export function featuredMenuSuggestions(
  items: MenuItem[],
  recommended: MenuItem[] | undefined,
  limit = 8
): MenuItem[] {
  const featured = [
    ...(recommended ?? []),
    ...items.filter((i) => i.isBestSeller || i.isRecommended),
    ...items,
  ];
  const seen = new Set<string>();
  const out: MenuItem[] = [];
  for (const item of featured) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}
