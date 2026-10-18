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
import { isNotFoundError, isServiceUnavailable, request } from '@/lib/review/review-http';
import type {
  MyRestaurantRating,
  PaginationMeta,
  ReportReviewPayload,
  RestaurantReview,
  ReviewListResult,
  ReviewStats,
  SubmitOrderReviewPayload,
  SubmitReviewPayload,
} from '@/lib/review/types';

const REVIEW_SERVICE = '/api/v1/review-service';

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
  /** GET /restaurants/:restaurantId/reviews/me — throws on outage so callers don't assume "not rated". */
  getMyRestaurantRating: async (restaurantId: string): Promise<MyRestaurantRating> => {
    const res = await request<Record<string, unknown>>(
      `${REVIEW_SERVICE}/restaurants/${restaurantId}/reviews/me`
    );
    const data = asRecord(res.data);
    const review = data.review ? mapReview(asRecord(data.review)) : null;
    return { rated: data.rated === true, review };
  },

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
