import type { SearchDish } from '@/lib/search/types';

export type CategoryFilterId = 'veg' | 'nonveg' | 'bestseller' | 'price';

export const CATEGORY_FILTERS: { id: CategoryFilterId; label: string }[] = [
  { id: 'veg', label: 'Pure veg' },
  { id: 'nonveg', label: 'Non-veg' },
  { id: 'bestseller', label: 'Bestsellers' },
  { id: 'price', label: 'Price: low to high' },
];

/** Veg and non-veg cancel each other; the rest stack. */
export function toggleCategoryFilter(active: CategoryFilterId[], id: CategoryFilterId): CategoryFilterId[] {
  if (active.includes(id)) return active.filter((f) => f !== id);
  const opposite = id === 'veg' ? 'nonveg' : id === 'nonveg' ? 'veg' : null;
  return [...active.filter((f) => f !== opposite), id];
}

const finalPrice = (d: SearchDish) => d.discountedPrice ?? d.price;

/** Open kitchens first; closed ones stay visible at the end. */
export function applyCategoryFilters(dishes: SearchDish[], active: CategoryFilterId[]): SearchDish[] {
  let out = dishes;
  if (active.includes('veg')) out = out.filter((d) => d.isVeg === true);
  if (active.includes('nonveg')) out = out.filter((d) => d.isVeg === false);
  if (active.includes('bestseller')) out = out.filter((d) => d.isBestSeller);
  const open = (d: SearchDish) => (d.restaurantIsOpen === false ? 1 : 0);
  return [...out].sort((a, b) =>
    open(a) - open(b) || (active.includes('price') ? finalPrice(a) - finalPrice(b) : 0),
  );
}

export type CategoryRestaurant = {
  id: string;
  name: string;
  imageUrl?: string;
  dishCount: number;
  distanceKm?: number;
  isOpen: boolean;
};

/** Kitchens serving this category, most dishes first. */
export function restaurantsFromDishes(dishes: SearchDish[]): CategoryRestaurant[] {
  const map = new Map<string, CategoryRestaurant>();
  for (const d of dishes) {
    const row = map.get(d.restaurantId);
    if (row) {
      row.dishCount += 1;
      continue;
    }
    map.set(d.restaurantId, {
      id: d.restaurantId,
      name: d.restaurantName || 'Restaurant',
      imageUrl: d.restaurantImageUrl,
      dishCount: 1,
      distanceKm: d.distanceKm,
      isOpen: d.restaurantIsOpen !== false,
    });
  }
  return [...map.values()].sort(
    (a, b) => Number(b.isOpen) - Number(a.isOpen) || b.dishCount - a.dishCount,
  );
}
