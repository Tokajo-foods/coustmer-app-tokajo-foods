import { useEffect, useRef, useState } from 'react';

import { menuCategoryMatchesCuisine, resolveMenuCategoryId } from '@/lib/restaurant/categories';
import { useMenuItem } from '@/lib/restaurant/hooks';
import type { MenuItem } from '@/lib/restaurant/types';

const JUMP_RETRY_MS = 150;
const JUMP_ATTEMPTS = 12;
const HIGHLIGHT_MS = 4000;

type Category = { id: string; name: string };

function categoryFor(categories: Category[], token?: string): string | undefined {
  const t = token?.trim();
  if (!t) return undefined;
  const lower = t.toLowerCase();
  return (
    categories.find((c) => String(c.id) === t)?.id ||
    categories.find((c) => c.name.trim().toLowerCase() === lower)?.id ||
    resolveMenuCategoryId(categories, t) ||
    categories.find((c) => menuCategoryMatchesCuisine(c, t))?.id
  );
}

/**
 * Restaurant menu deep links:
 * - `itemId` + `focus=section` (search) → scroll to the dish's section and highlight it.
 * - `itemId` alone → scroll to its section and open the item sheet.
 * - `categoryId` / `category` → scroll to that section.
 */
export function useMenuDeepLink(input: {
  restaurantId: string;
  items: MenuItem[];
  menuLoading: boolean;
  categories: Category[];
  focusItemId?: string;
  focusCategoryId?: string;
  focusCategory?: string;
  sectionOnly: boolean;
  jumpToCategory: (catId: string) => boolean;
  onOpenItem: (item: MenuItem) => void;
}) {
  const { restaurantId, items, menuLoading, categories, focusItemId, focusCategoryId, focusCategory } = input;
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const done = useRef(false);
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(input);
  latest.current = input;
  const itemQuery = useMenuItem(restaurantId, focusItemId || '');

  useEffect(() => {
    if (done.current || menuLoading || !categories.length) return;
    if (!focusItemId && !focusCategoryId && !focusCategory) return;

    let found: MenuItem | null = null;
    if (focusItemId) {
      found =
        items.find((item) => String(item.id) === String(focusItemId)) ??
        (itemQuery.data && String(itemQuery.data.id) === String(focusItemId) ? itemQuery.data : null);
      if (!found && (itemQuery.isLoading || itemQuery.isFetching)) return;
    }

    const catId =
      categoryFor(categories, found?.categoryId) ||
      categoryFor(categories, found?.categoryName) ||
      categoryFor(categories, focusCategoryId) ||
      categoryFor(categories, focusCategory);
    if (!found && !catId) return;
    done.current = true;

    if (found) {
      if (latest.current.sectionOnly) setHighlightedItemId(String(found.id));
      else latest.current.onOpenItem(found);
    }
    if (!catId) return;

    let attempts = 0;
    const tryJump = () => {
      attempts += 1;
      if (latest.current.jumpToCategory(catId) || attempts >= JUMP_ATTEMPTS) return;
      jumpTimer.current = setTimeout(tryJump, JUMP_RETRY_MS);
    };
    jumpTimer.current = setTimeout(tryJump, 300);
  }, [
    focusItemId,
    focusCategoryId,
    focusCategory,
    menuLoading,
    items,
    categories,
    itemQuery.data,
    itemQuery.isLoading,
    itemQuery.isFetching,
  ]);

  useEffect(() => () => {
    if (jumpTimer.current) clearTimeout(jumpTimer.current);
  }, []);

  useEffect(() => {
    if (!highlightedItemId) return;
    const timer = setTimeout(() => setHighlightedItemId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightedItemId]);

  return { highlightedItemId };
}
