import { resolveIsOpen } from '@/lib/restaurant/mappers';
import { firstImageFromList, resolveMediaUrl } from '@/lib/restaurant/media';
import type {
  SearchCategory,
  SearchDish,
  SearchMatchReason,
  SearchRestaurant,
  SearchSuggestion,
  SearchSuggestionType,
} from '@/lib/search/types';

type Raw = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const bool = (v: unknown) => (typeof v === 'boolean' ? v : undefined);

function addressText(raw: unknown): { address?: string; city?: string } {
  if (typeof raw === 'string') return { address: raw };
  if (!raw || typeof raw !== 'object') return {};
  const a = raw as Raw;
  const address = [a.street, a.area, a.city, a.state, a.pincode].filter(Boolean).map(String).join(', ');
  return { address: address || undefined, city: str(a.city) };
}

export function mapSearchRestaurant(raw: Raw): SearchRestaurant {
  const { address, city } = addressText(raw.address);
  const coords = (raw.location as { coordinates?: number[] } | undefined)?.coordinates;
  const settings = (raw.settings && typeof raw.settings === 'object' ? raw.settings : {}) as Raw;
  const cuisines = Array.isArray(raw.cuisines) ? (raw.cuisines as unknown[]).map(String).filter(Boolean) : undefined;
  const fromImages = firstImageFromList(raw.images);
  const rating = num(raw.avgRating) ?? num(raw.rating);

  return {
    id: String(raw._id ?? raw.id ?? ''),
    name: str(raw.name) ?? 'Restaurant',
    description: str(raw.description),
    imageUrl: resolveMediaUrl(str(raw.logo) ?? str(raw.imageUrl) ?? str(raw.coverImage) ?? fromImages),
    coverUrl: resolveMediaUrl(str(raw.coverImage) ?? str(raw.coverUrl) ?? fromImages),
    rating: rating && rating > 0 ? rating : undefined,
    reviewCount: num(raw.totalRatings) ?? num(raw.reviewCount),
    cuisines,
    deliveryTime: num(raw.avgPrepTime) ? `${raw.avgPrepTime} mins` : str(raw.deliveryTime),
    priceForTwo: num(raw.costForTwo) ?? num(raw.priceForTwo),
    costForTwo: num(raw.costForTwo),
    distance: num(raw.distanceKm) ?? num(raw.distance),
    isOpen: bool(raw.isOpenNow) ?? resolveIsOpen(raw),
    isOnline: bool(raw.isOnline),
    isOpenNow: bool(raw.isOpenNow),
    kitchenStatus:
      raw.kitchenStatus === 'online' ||
      raw.kitchenStatus === 'paused' ||
      raw.kitchenStatus === 'offline'
        ? raw.kitchenStatus
        : undefined,
    pausedAt: str(raw.pausedAt) ?? null,
    pausedUntil: str(raw.pausedUntil) ?? null,
    availabilityLabel: str(raw.availabilityLabel) ?? null,
    nextOpenAt: str(raw.nextOpenAt),
    closedReason: str(raw.closedReason),
    address,
    city,
    isPureVeg: bool(raw.isPureVeg) ?? bool(settings.isPureVeg),
    lat: Array.isArray(coords) ? num(coords[1]) : undefined,
    lng: Array.isArray(coords) ? num(coords[0]) : undefined,
    matchReason: str(raw.matchReason) as SearchMatchReason | undefined,
  };
}

export function mapSearchDish(raw: Raw): SearchDish {
  const discounted = num(raw.discountedPrice);
  return {
    id: String(raw._id ?? raw.id ?? ''),
    name: str(raw.name) ?? 'Dish',
    description: str(raw.description),
    price: Number(raw.price ?? 0),
    discountedPrice: discounted !== undefined && discounted > 0 ? discounted : undefined,
    imageUrl: resolveMediaUrl(str(raw.image) ?? str(raw.imageUrl) ?? firstImageFromList(raw.images)),
    isVeg: bool(raw.isVeg),
    isBestSeller: bool(raw.isBestSeller),
    restaurantId: String(raw.restaurantId ?? ''),
    restaurantName: str(raw.restaurantName),
    restaurantImageUrl: resolveMediaUrl(str(raw.restaurantImage)),
    restaurantIsOpen: bool(raw.restaurantIsOpen),
    categoryId: str(raw.categoryId),
    categoryName: str(raw.categoryName),
  };
}

export function mapSearchCategory(raw: Raw): SearchCategory {
  return {
    id: String(raw.id ?? raw._id ?? raw.slug ?? ''),
    name: str(raw.name) ?? '',
    slug: str(raw.slug) ?? '',
    imageUrl: resolveMediaUrl(str(raw.imageUrl)),
    itemCount: num(raw.itemCount),
    restaurantCount: num(raw.restaurantCount),
    source: raw.source === 'cuisine' ? 'cuisine' : 'food_category',
  };
}

export function mapSearchSuggestion(raw: Raw): SearchSuggestion | null {
  const type = raw.type as SearchSuggestionType;
  if (type !== 'restaurant' && type !== 'dish' && type !== 'category') return null;
  const text = str(raw.text) ?? str(raw.name);
  if (!text) return null;
  return {
    id: `${type}-${String(raw.id ?? text)}`,
    type,
    text,
    subtitle: str(raw.subtitle),
    imageUrl: resolveMediaUrl(str(raw.imageUrl)),
    restaurantId: str(raw.restaurantId),
    restaurantName: str(raw.restaurantName),
    dishId: str(raw.dishId),
    slug: str(raw.slug),
    source: type === 'category' ? (raw.source === 'cuisine' ? 'cuisine' : 'food_category') : undefined,
    price: num(raw.price),
    isVeg: bool(raw.isVeg),
    rating: num(raw.rating),
    isOpen: bool(raw.isOpen),
  };
}
