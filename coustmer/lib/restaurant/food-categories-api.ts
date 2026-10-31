import { api } from '@/lib/api';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';

const BASE = '/api/v1/restaurant-service/food-categories';

export type NearbyFoodCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  itemCount: number;
  restaurantCount: number;
};

type Envelope<T> = { success?: boolean; data?: T };

function asRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    if (Array.isArray(rec.categories)) return rec.categories as Record<string, unknown>[];
    if (Array.isArray(rec.data)) return rec.data as Record<string, unknown>[];
  }
  return [];
}

function mapRow(row: Record<string, unknown>): NearbyFoodCategory | null {
  const id = String(row.id ?? row._id ?? '').trim();
  const name = String(row.name ?? '').trim();
  const slug = String(row.slug ?? '').trim();
  if (!id || !name || !slug) return null;
  return {
    id,
    name,
    slug,
    imageUrl: typeof row.imageUrl === 'string' ? row.imageUrl : null,
    itemCount: Number(row.itemCount ?? 0) || 0,
    restaurantCount: Number(row.restaurantCount ?? 0) || 0,
  };
}

/** GET /food-categories/nearby — home chips from dishes near the pin, including Other categories kitchens just created. */
export async function getNearbyFoodCategories(input: {
  lat: number;
  lng: number;
  radiusKm?: number;
}): Promise<NearbyFoodCategory[]> {
  const res = await api.get<Envelope<unknown>>(`${BASE}/nearby`, {
    params: {
      lat: input.lat,
      lng: input.lng,
      radius: input.radiusKm ?? CUSTOMER_DISCOVERY_RADIUS_KM,
    },
    withCredentials: true,
    timeout: 12_000,
  });
  return asRows(res.data?.data ?? res.data)
    .map(mapRow)
    .filter((row): row is NearbyFoodCategory => row !== null);
}
