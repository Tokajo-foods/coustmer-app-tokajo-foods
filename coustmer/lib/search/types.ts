/**
 * Search Service (public). Gateway prefix: /api/v1/search-service
 * Every call is scoped to restaurants that deliver to the pin (same radius as home).
 */

export type SearchMatchReason = 'name' | 'cuisine' | 'serves_dish' | 'serves_category';
export type SearchSuggestionType = 'restaurant' | 'dish' | 'category';
export type SearchCategorySource = 'cuisine' | 'food_category';

export type SearchRestaurant = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  coverUrl?: string;
  rating?: number;
  reviewCount?: number;
  cuisines?: string[];
  deliveryTime?: string;
  priceForTwo?: number;
  costForTwo?: number;
  distance?: number;
  isOpen?: boolean;
  address?: string;
  city?: string;
  offer?: string;
  isPureVeg?: boolean;
  lat?: number;
  lng?: number;
  isOnline?: boolean;
  isOpenNow?: boolean;
  kitchenStatus?: 'online' | 'paused' | 'offline';
  pausedAt?: string | null;
  pausedUntil?: string | null;
  availabilityLabel?: string | null;
  nextOpenAt?: string;
  closedReason?: string;
  /** Why it matched: its name, a cuisine tag, or a dish on its menu. */
  matchReason?: SearchMatchReason;
};

export type SearchDish = {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  imageUrl?: string;
  isVeg?: boolean;
  isBestSeller?: boolean;
  restaurantId: string;
  restaurantName?: string;
  restaurantImageUrl?: string;
  restaurantIsOpen?: boolean;
  categoryId?: string;
  categoryName?: string;
};

export type SearchCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  /** Dishes nearby (food categories). */
  itemCount?: number;
  /** Restaurants nearby (cuisines). */
  restaurantCount?: number;
  source: SearchCategorySource;
};

export type SearchSuggestion = {
  id: string;
  type: SearchSuggestionType;
  text: string;
  subtitle?: string;
  imageUrl?: string;
  restaurantId?: string;
  restaurantName?: string;
  dishId?: string;
  slug?: string;
  source?: SearchCategorySource;
  price?: number;
  isVeg?: boolean;
  rating?: number;
  isOpen?: boolean;
};

/** Pin + radius (meters) that limit every search to restaurants delivering here. */
export type SearchScope = {
  lat?: number;
  lng?: number;
  radius?: number;
  veg?: boolean;
};

export type SearchSuggestionsParams = SearchScope & { q: string; limit?: number };
export type SearchCombinedParams = SearchScope & { q: string; limit?: number };
export type SearchRestaurantsParams = SearchScope & {
  q?: string;
  cuisine?: string;
  sort?: string;
  page?: number;
  limit?: number;
};
export type SearchCategoryDishesParams = SearchScope & {
  slug: string;
  name?: string;
  source?: SearchCategorySource;
  limit?: number;
};

export type SearchSuggestionsResult = {
  query: string;
  correctedQuery?: string;
  suggestions: SearchSuggestion[];
};

export type SearchCombinedResult = {
  query: string;
  correctedQuery?: string;
  restaurants: SearchRestaurant[];
  dishes: SearchDish[];
  categories: SearchCategory[];
};

export type SearchRestaurantsResult = {
  restaurants: SearchRestaurant[];
  total: number;
};

export type SearchCategoryDishesResult = {
  category: { name: string; slug: string; source?: SearchCategorySource; imageUrl?: string };
  restaurantCount: number;
  dishes: SearchDish[];
};
