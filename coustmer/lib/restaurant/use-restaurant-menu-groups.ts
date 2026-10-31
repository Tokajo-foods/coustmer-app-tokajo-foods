import { useMemo } from 'react';

import type { MenuFilterId } from '@/components/restaurant/detail/RestaurantMenuSearchBar';
import type { MenuItem } from '@/lib/restaurant/types';

export type MenuGroup = { id: string; name: string; items: MenuItem[] };

const textOf = (v: unknown) => String(v ?? '').toLowerCase();

function bestsellers(items: MenuItem[]): MenuItem[] {
  const flagged = items.filter(
    (item) => item.isBestSeller === true || (item.tags ?? []).some((t) => textOf(t).includes('best'))
  );
  if (flagged.length) return flagged;
  return [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 12);
}

function recommended(items: MenuItem[], fromApi: MenuItem[], vegOnly: boolean): MenuItem[] {
  const api = fromApi.filter((item) => (vegOnly ? item.isVeg === true : true));
  const flagged = items.filter(
    (item) =>
      item.isRecommended === true ||
      item.isBestSeller === true ||
      (item.tags ?? []).some((t) => {
        const tag = textOf(t);
        return tag.includes('recommend') || tag.includes('chef') || tag.includes('popular') || tag.includes('best');
      })
  );
  const byId = new Map<string, MenuItem>();
  for (const item of [...api, ...flagged]) byId.set(item.id, item);
  if (byId.size) return [...byId.values()];
  // Kitchen didn't mark recommended — show top-rated dishes so the filter isn't empty.
  return [...items]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 12);
}

function itemInCategory(item: MenuItem, cat: { id: string; name: string }): boolean {
  if (item.categoryId && String(item.categoryId) === String(cat.id)) return true;
  const itemName = (item.categoryName ?? '').trim().toLowerCase();
  const catName = (cat.name ?? '').trim().toLowerCase();
  return Boolean(itemName && catName && itemName === catName);
}

/** Filtered menu grouped by kitchen section, plus the chips for the category rail. */
export function useRestaurantMenuGroups(input: {
  items: MenuItem[];
  recommended?: MenuItem[];
  menuCategories: { id: string; name: string }[];
  filter: MenuFilterId;
  vegOnly: boolean;
}) {
  const { items: all, recommended: fromApi, menuCategories, filter, vegOnly } = input;

  const visibleItems = useMemo(() => {
    if (filter === 'veg' || vegOnly) return all.filter((item) => item.isVeg === true);
    if (filter === 'non_veg') return all.filter((item) => item.isVeg === false);
    if (filter === 'bestsellers') return bestsellers(all);
    if (filter === 'recommended') return recommended(all, fromApi ?? [], vegOnly);
    return all;
  }, [all, fromApi, filter, vegOnly]);

  const categories = useMemo(() => {
    if (menuCategories.length) return menuCategories;
    const names = new Map<string, string>();
    for (const item of visibleItems) {
      const name = item.categoryName || 'Menu';
      const cid = item.categoryId || name;
      if (!names.has(cid)) names.set(cid, name);
    }
    return [...names.entries()].map(([id, name]) => ({ id, name }));
  }, [menuCategories, visibleItems]);

  const grouped = useMemo<MenuGroup[]>(() => {
    const fullMenu = visibleItems.length ? [{ id: 'all', name: 'Full menu', items: visibleItems }] : [];
    if (!categories.length) return fullMenu;

    const byCat = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: visibleItems.filter((item) => itemInCategory(item, cat)),
    }));
    const used = new Set(byCat.flatMap((c) => c.items.map((i) => i.id)));
    const leftover = visibleItems.filter((i) => !used.has(i.id));
    if (leftover.length) byCat[0] = { ...byCat[0], items: [...byCat[0].items, ...leftover] };

    const filled = byCat.filter((c) => c.items.length > 0);
    return filled.length ? filled : fullMenu;
  }, [categories, visibleItems]);

  const categoryChips = useMemo(
    () => grouped.map((cat) => ({ id: cat.id, name: cat.name, count: cat.items.length })),
    [grouped]
  );

  return { visibleItems, categories, grouped, categoryChips };
}
