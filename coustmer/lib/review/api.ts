import axios from 'axios';

import { api } from '@/lib/api';
import {
  asRecord,
  clampRating,
  emptyDistribution,
  extractList,
  extractMeta,
  mapDishRatings,
  mapReview,
  mapStats,
  requireStarRating,
} from '@/lib/review/mappers';
import type {
  PaginationMeta,
  ReportReviewPayload,
  RestaurantReview,
  ReviewListResult,
  ReviewStats,
  SubmitOrderReviewPayload,
  SubmitReviewPayload,
} from '@/lib/review/types';

const REVIEW_SERVICE = '/api/v1/review-service';

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};

async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
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
      timeout: 12_000,
      headers: isMutating
        ? {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }
        : { Accept: 'application/json' },
      validateStatus: (status) => status >= 200 && status < 500,
    });

    if (response.status >= 400) {
      const data = response.data as
        | { message?: string; error?: string; success?: boolean }
        | undefined;
      const err = new Error(
        data?.message || data?.error || `Request failed (${response.status})`
      ) as Error & { status?: number };
      err.status = response.status;
      throw err;
    }

    const payload = response.data as Envelope<T> | T;
    if (
      payload &&
      typeof payload === 'object' &&
      ('data' in (payload as object) || 'success' in (payload as object))
    ) {
      const envelope = payload as Envelope<T>;
      if (envelope.success === false) {
        const err = new Error(
          envelope.message || 'Review service unavailable'
        ) as Error & { status?: number };
        err.status = 502;
        throw err;
      }
      return envelope;
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

      if (message.toLowerCase().includes('csrf')) {
        throw new Error(
          'Security token expired. Close and reopen the app, then try again.'
        );
      }

      const err = new Error(message) as Error & { status?: number };
      err.status = error.response.status;
      throw err;
    }

    throw error;
  }
}


function isNotFoundError(error: unknown): boolean {
  const status = (error as Error & { status?: number }).status;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    status === 404 ||
    status === 204 ||
    message.includes('not found') ||
    message.includes('no review') ||
    message.includes('not reviewed') ||
    message.includes('has not reviewed')
  );
}

function isServiceUnavailable(error: unknown): boolean {
  const status = (error as Error & { status?: number }).status;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes('unable to reach') ||
    message.includes('unavailable') ||
    message.includes('try again later')
  );
}

export const reviewApi = {
  /** GET /restaurants/:restaurantId/reviews — `withComment` keeps only reviews with written text. */
  getRestaurantReviews: async (
    restaurantId: string,
    params?: { page?: number; limit?: number; withComment?: boolean }
  ): Promise<ReviewListResult> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit ?? 20));
    if (params?.withComment) query.set('withComment', 'true');
    const qs = query.toString();

    try {
      const res = await request<unknown>(
        `${REVIEW_SERVICE}/restaurants/${restaurantId}/reviews${qs ? `?${qs}` : ''}`
      );

      const reviews = extractList(res.data)
        .map(mapReview)
        .filter((r) => r.id && r.rating > 0)
        .sort((a, b) => {
          const at = a.createdAt ? Date.parse(a.createdAt) : 0;
          const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
          return bt - at;
        });

      return {
        reviews,
        meta: extractMeta(res.data, res.meta) ?? {
          total: reviews.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      };
    } catch (error) {
      if (isNotFoundError(error)) {
        return { reviews: [], meta: { total: 0, page: 1, limit: params?.limit ?? 20 } };
      }
      throw error;
    }
  },

  /** GET /restaurants/:restaurantId/reviews/stats */
  getRestaurantReviewStats: async (
    restaurantId: string
  ): Promise<ReviewStats> => {
    try {
      const res = await request<unknown>(
        `${REVIEW_SERVICE}/restaurants/${restaurantId}/reviews/stats`
      );
      return mapStats(res.data);
    } catch (error) {
      if (isNotFoundError(error)) {
        return { average: 0, total: 0, writtenReviews: 0, distribution: emptyDistribution() };
      }
      throw error;
    }
  },

  /** PUT /restaurants/:restaurantId/reviews/:reviewId (auth) */
  updateRestaurantReview: async (
    restaurantId: string,
    reviewId: string,
    payload: SubmitReviewPayload
  ): Promise<RestaurantReview> => {
    if (!restaurantId) throw new Error('Restaurant is missing for this review.');
    if (!reviewId) throw new Error('Review ID is missing.');
    const rating = clampRating(payload.rating);
    if (rating < 1) throw new Error('Please select a rating from 1 to 5 stars.');

    const body = {
      rating,
      comment: payload.comment?.trim() || undefined,
      review: payload.comment?.trim() || undefined,
      title: payload.title?.trim() || undefined,
      orderId: payload.orderId || undefined,
      photos: payload.photos?.filter(Boolean),
      images: payload.photos?.filter(Boolean),
    };

    const res = await request<Record<string, unknown>>(
      `${REVIEW_SERVICE}/restaurants/${restaurantId}/reviews/${reviewId}`,
      { method: 'PUT', body }
    );
    return mapReview(asRecord(res.data ?? {}));
  },

  /** DELETE /restaurants/:restaurantId/reviews/:reviewId (auth) */
  deleteRestaurantReview: async (
    restaurantId: string,
    reviewId: string
  ): Promise<void> => {
    if (!restaurantId) throw new Error('Restaurant is missing for this review.');
    if (!reviewId) throw new Error('Review ID is missing.');
    await request<unknown>(
      `${REVIEW_SERVICE}/restaurants/${restaurantId}/reviews/${reviewId}`,
      { method: 'DELETE' }
    );
  },

  /** POST /restaurants/:restaurantId/reviews/:reviewId/report */
  reportRestaurantReview: async (
    restaurantId: string,
    reviewId: string,
    payload: ReportReviewPayload
  ): Promise<void> => {
    if (!restaurantId) throw new Error('Restaurant is missing for this review.');
    if (!reviewId) throw new Error('Review ID is missing.');
    if (!payload.reason?.trim()) throw new Error('Please select a reason to report.');
    await request<unknown>(
      `${REVIEW_SERVICE}/restaurants/${restaurantId}/reviews/${reviewId}/report`,
      { method: 'POST', body: { reason: payload.reason.trim() } }
    );
  },

  /**
   * GET /orders/:orderId/review (auth)
   * Returns null when not reviewed yet, or when review-service is briefly down
   * so Rate CTA still shows (Swiggy-style).
   */
  getOrderReview: async (
    orderId: string
  ): Promise<RestaurantReview | null> => {
    try {
      const res = await request<Record<string, unknown> | null>(
        `${REVIEW_SERVICE}/orders/${orderId}/review`
      );
      if (!res.data) return null;
      const mapped = mapReview(asRecord(res.data));
      return mapped.id || mapped.rating ? mapped : null;
    } catch (error) {
      if (isNotFoundError(error) || isServiceUnavailable(error)) {
        return null;
      }
      throw error;
    }
  },

  /** POST /orders/:orderId/reviews — restaurant stars + optional written review */
  submitOrderReview: async (
    orderId: string,
    payload: SubmitOrderReviewPayload
  ): Promise<RestaurantReview> => {
    if (!orderId) throw new Error('Order ID is missing.');
    const restaurantRating = requireStarRating(payload.rating, 'food rating');
    const packagingRaw =
      payload.packagingRating === undefined || payload.packagingRating === null
        ? undefined
        : requireStarRating(payload.packagingRating, 'packaging rating');
    const imageUrls = (payload.photos ?? []).filter(Boolean);
    const dishes = mapDishRatings(payload.dishes);

    const body: Record<string, unknown> = {
      restaurantRating,
      comment: payload.comment?.trim() || undefined,
      customerName: undefined,
      imageUrls: imageUrls.length ? imageUrls : undefined,
    };
    if (packagingRaw !== undefined) body.packagingRating = packagingRaw;
    if (dishes?.length) body.dishes = dishes;

    const res = await request<Record<string, unknown>>(
      `${REVIEW_SERVICE}/orders/${orderId}/reviews`,
      { method: 'POST', body }
    );
    const data = asRecord(res.data ?? {});
    const reviewRaw =
      data.review && typeof data.review === 'object'
        ? asRecord(data.review)
        : data;
    return mapReview(reviewRaw);
  },
};
