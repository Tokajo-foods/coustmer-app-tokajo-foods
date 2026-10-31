import type { LiveHit } from '@/lib/search/live-menu-search';
import type {
  SearchCategoryDishesResult,
  SearchCombinedResult,
  SearchSuggestion,
  SearchSuggestionsResult,
} from '@/lib/search/types';

const COMPLETION_CAP = 4;
const CATEGORY_CAP = 4;
const DISH_CAP = 8;
const RESTAURANT_CAP = 6;

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Names that start with what the customer typed — tapping fills the box (autocomplete). */
function completions(q: string, hit: LiveHit): SearchSuggestion[] {
  const typed = norm(q);
  const seen = new Set<string>([typed]);
  const out: SearchSuggestion[] = [];
  const names = [
    ...hit.categories.map((c) => c.name),
    ...hit.dishes.filter((d) => d.matchedBy === 'name').map((d) => d.name),
    ...hit.restaurants.filter((r) => r.matchReason === 'name').map((r) => r.name),
  ];
  for (const name of names) {
    const key = norm(name);
    if (!key.startsWith(typed) || seen.has(key)) continue;
    seen.add(key);
    out.push({ id: `query-${key}`, type: 'query', text: name });
    if (out.length >= COMPLETION_CAP) break;
  }
  return out;
}

function categorySubtitle(itemCount?: number, restaurantCount?: number): string {
  const parts = [
    itemCount ? plural(itemCount, 'dish', 'dishes') : null,
    restaurantCount ? plural(restaurantCount, 'restaurant') : null,
  ].filter(Boolean);
  return parts.length ? `${parts.join(' · ')} near you` : 'Category';
}

export function toSuggestions(q: string, hit: LiveHit, limit = DISH_CAP): SearchSuggestionsResult {
  const categories: SearchSuggestion[] = hit.categories.slice(0, CATEGORY_CAP).map((c) => ({
    id: `category-${c.id}`,
    type: 'category',
    text: c.name,
    subtitle: categorySubtitle(c.itemCount, c.restaurantCount),
    imageUrl: c.imageUrl,
    slug: c.slug,
    source: c.source,
  }));

  const seenDish = new Set<string>();
  const dishes: SearchSuggestion[] = [];
  for (const d of hit.dishes) {
    const key = `${d.restaurantId}:${norm(d.name)}`;
    if (seenDish.has(key)) continue;
    seenDish.add(key);
    dishes.push({
      id: `dish-${d.id}`,
      type: 'dish',
      text: d.name,
      subtitle: [d.restaurantName, d.categoryName].filter(Boolean).join(' · '),
      imageUrl: d.imageUrl,
      restaurantId: d.restaurantId,
      restaurantName: d.restaurantName,
      dishId: d.id,
      categoryId: d.categoryId,
      categoryName: d.categoryName,
      price: d.price,
      discountedPrice: d.discountedPrice,
      isVeg: d.isVeg,
      isOpen: d.restaurantIsOpen,
    });
    if (dishes.length >= limit) break;
  }

  const direct = hit.restaurants.filter((r) => r.matchReason === 'name' || r.matchReason === 'cuisine');
  const serving = hit.restaurants.filter((r) => r.matchReason === 'serves_dish');
  const restaurants: SearchSuggestion[] = [...direct, ...(direct.length < 3 ? serving : [])]
    .slice(0, RESTAURANT_CAP)
    .map((r) => ({
      id: `restaurant-${r.id}`,
      type: 'restaurant',
      text: r.name,
      subtitle: r.matchReason === 'serves_dish' && r.matchedDishCount
        ? `Serves ${plural(r.matchedDishCount, 'matching dish', 'matching dishes')}`
        : r.cuisines?.slice(0, 2).join(', ') || 'Restaurant',
      imageUrl: r.imageUrl,
      restaurantId: r.id,
      rating: r.rating,
      isOpen: r.isOnline,
    }));

  return { query: q, suggestions: [...completions(q, hit), ...categories, ...dishes, ...restaurants] };
}

export function toCombined(q: string, hit: LiveHit): SearchCombinedResult {
  return { query: q, restaurants: hit.restaurants, dishes: hit.dishes, categories: hit.categories };
}

/** Category page: dishes named after or filed under the category (not description-only hits). */
export function toCategoryDishes(name: string, slug: string, hit: LiveHit): SearchCategoryDishesResult {
  const dishes = hit.dishes.filter((d) => d.matchedBy !== 'description');
  const match = hit.categories.find((c) => c.slug === slug || norm(c.name) === norm(name));
  return {
    category: { name: match?.name ?? name, slug, source: match?.source ?? 'food_category', imageUrl: match?.imageUrl },
    restaurantCount: new Set(dishes.map((d) => d.restaurantId)).size,
    dishes,
  };
}
