import axios from 'axios';
import { api } from '@/lib/api';
import { formatInr } from '@/lib/format/money';

export type OfferType = 'percentage' | 'fixed' | 'bogo' | 'freeDelivery';

export type Offer = {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  type: OfferType;
  value: number;
  code?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  termsAndConditions?: string;
  applicableOn?: string[];
  usageLimit?: number;
  usageCount?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OfferListResult = {
  offers: Offer[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
};

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: any;
};

async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
  } = {}
): Promise<Envelope<T>> {
  const { method = 'GET', body } = options;
  const isMutating = method !== 'GET';

  try {
    const response = await api.request<Envelope<T> | T>({
      url: path,
      method,
      data: isMutating ? (body ?? {}) : body,
      withCredentials: true,
      headers: isMutating
        ? {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }
        : { Accept: 'application/json' },
    });

    const payload = response.data as Envelope<T> | T;
    if (
      payload &&
      typeof payload === 'object' &&
      ('data' in (payload as object) || 'success' in (payload as object))
    ) {
      return payload as Envelope<T>;
    }

    return { success: true, data: payload as T };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          'Network request failed. Check your internet connection and try again.'
        );
      }

      const data = error.response.data as
        | { message?: string; error?: string }
        | undefined;
      const message =
        data?.message ||
        data?.error ||
        `Request failed (${error.response.status})`;

      throw new Error(message);
    }

    throw error;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function extractList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  const nested =
    record.offers ??
    record.items ??
    record.results ??
    record.docs ??
    record.list ??
    record.data ??
    [];
  if (Array.isArray(nested)) return nested as Record<string, unknown>[];
  if (nested && typeof nested === 'object') return extractList(nested);
  return [];
}

function mapOffer(data: Record<string, unknown>): Offer {
  return {
    id: String(data._id ?? data.id ?? data.offerId ?? ''),
    restaurantId: String(data.restaurantId ?? data.restaurant_id ?? ''),
    title: String(data.title ?? data.name ?? 'Special Offer'),
    description: String(data.description ?? data.desc ?? ''),
    type: (data.type as OfferType) || 'percentage',
    value: Number(data.value ?? data.discount ?? data.amount ?? 0),
    code: (data.code as string) || (data.couponCode as string) || undefined,
    minOrderAmount: Number(data.minOrderAmount ?? data.minOrder ?? 0) || undefined,
    maxDiscountAmount: Number(data.maxDiscountAmount ?? data.maxDiscount ?? 0) || undefined,
    validFrom: String(data.validFrom ?? data.startDate ?? data.startTime ?? ''),
    validUntil: String(data.validUntil ?? data.endDate ?? data.endTime ?? ''),
    isActive: Boolean(data.isActive ?? data.active ?? true),
    termsAndConditions: (data.termsAndConditions as string) || (data.terms as string) || undefined,
    applicableOn: Array.isArray(data.applicableOn) ? data.applicableOn as string[] : undefined,
    usageLimit: Number(data.usageLimit ?? 0) || undefined,
    usageCount: Number(data.usageCount ?? data.timesUsed ?? 0) || undefined,
    imageUrl: (data.imageUrl as string) || (data.image as string) || undefined,
    createdAt: (data.createdAt as string) || undefined,
    updatedAt: (data.updatedAt as string) || undefined,
  };
}

export const restaurantOffersApi = {
  /** GET /restaurants/:restaurantId/offers */
  getOffers: async (restaurantId: string): Promise<OfferListResult> => {
    const res = await request<unknown>(`/api/v1/restaurant-service/restaurants/${restaurantId}/offers`);
    const list = extractList(res.data);
    return {
      offers: (list.length ? list : extractList(res)).map(mapOffer),
      meta: res.meta,
    };
  },

  /** GET /restaurants/:restaurantId/offers/:offerId */
  getOffer: async (restaurantId: string, offerId: string): Promise<Offer> => {
    const res = await request<Record<string, unknown>>(
      `/api/v1/restaurant-service/restaurants/${restaurantId}/offers/${offerId}`
    );
    return mapOffer(asRecord(res.data ?? res));
  },
};

export function formatOfferValue(offer: Offer): string {
  switch (offer.type) {
    case 'percentage':
      return `${offer.value}% OFF`;
    case 'fixed':
      return `${formatInr(offer.value)} OFF`;
    case 'bogo':
      return 'Buy 1 Get 1';
    case 'freeDelivery':
      return 'Free Delivery';
    default:
      return 'Special Offer';
  }
}

export function isOfferValid(offer: Offer): boolean {
  if (!offer.isActive) return false;
  
  const now = new Date();
  const validFrom = new Date(offer.validFrom);
  const validUntil = new Date(offer.validUntil);
  
  return now >= validFrom && now <= validUntil;
}
