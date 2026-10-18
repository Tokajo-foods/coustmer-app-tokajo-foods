import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { orderKeys } from '@/lib/order/hooks';
import { restaurantKeys } from '@/lib/restaurant/hooks';
import { reviewApi } from '@/lib/review/api';
import type {
  ReportReviewPayload,
  SubmitOrderReviewPayload,
  SubmitReviewPayload,
} from '@/lib/review/types';

type ListParams = { page?: number; limit?: number; withComment?: boolean };

export const reviewKeys = {
  all: ['review'] as const,
  restaurant: (restaurantId: string) => [...reviewKeys.all, 'restaurant', restaurantId] as const,
  restaurantReviews: (restaurantId: string, params?: ListParams) =>
    [...reviewKeys.restaurant(restaurantId), 'list', params ?? {}] as const,
  restaurantStats: (restaurantId: string) =>
    [...reviewKeys.restaurant(restaurantId), 'stats'] as const,
  myRestaurantRating: (restaurantId: string) => [...reviewKeys.restaurant(restaurantId), 'me'] as const,
  orderReview: (orderId: string) => [...reviewKeys.all, 'order', orderId] as const,
};

/** A rating changes the restaurant's average everywhere: reviews, detail page, home and search cards. */
function refreshAfterRating(queryClient: QueryClient, restaurantId?: string, orderId?: string) {
  if (orderId) void queryClient.invalidateQueries({ queryKey: reviewKeys.orderReview(orderId) });
  if (restaurantId) void queryClient.invalidateQueries({ queryKey: reviewKeys.restaurant(restaurantId) });
  void queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
  void queryClient.invalidateQueries({ queryKey: ['customer'] });
  void queryClient.invalidateQueries({ queryKey: orderKeys.all });
}

/** GET /restaurants/:restaurantId/reviews */
export function useRestaurantReviews(
  restaurantId: string,
  params?: ListParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: reviewKeys.restaurantReviews(restaurantId, params),
    queryFn: () => reviewApi.getRestaurantReviews(restaurantId, params),
    enabled: Boolean(restaurantId) && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
  });
}

/** GET /restaurants/:restaurantId/reviews/stats */
export function useRestaurantReviewStats(
  restaurantId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: reviewKeys.restaurantStats(restaurantId),
    queryFn: () => reviewApi.getRestaurantReviewStats(restaurantId),
    enabled: Boolean(restaurantId) && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
  });
}

/** GET /restaurants/:restaurantId/reviews/me — has this customer ever rated the restaurant. */
export function useMyRestaurantRating(
  restaurantId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: reviewKeys.myRestaurantRating(restaurantId),
    queryFn: () => reviewApi.getMyRestaurantRating(restaurantId),
    enabled: Boolean(restaurantId) && (options?.enabled ?? true),
    staleTime: 60_000,
    retry: 1,
  });
}

/** GET /orders/:orderId/review — null until the customer rates. */
export function useOrderReview(
  orderId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: reviewKeys.orderReview(orderId),
    queryFn: () => reviewApi.getOrderReview(orderId),
    enabled: Boolean(orderId) && (options?.enabled ?? true),
    staleTime: 15_000,
    retry: 1,
  });
}

/** POST /orders/:orderId/reviews */
export function useSubmitOrderReview(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitOrderReviewPayload) => reviewApi.submitOrderReview(orderId, payload),
    onSuccess: (_data, variables) => refreshAfterRating(queryClient, variables.restaurantId, orderId),
  });
}

/** PUT /restaurants/:restaurantId/reviews/:reviewId */
export function useUpdateRestaurantReview(restaurantId: string, reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) =>
      reviewApi.updateRestaurantReview(restaurantId, reviewId, payload),
    onSuccess: (_data, variables) => refreshAfterRating(queryClient, restaurantId, variables.orderId),
  });
}

/** DELETE /restaurants/:restaurantId/reviews/:reviewId */
export function useDeleteRestaurantReview(restaurantId: string, reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reviewApi.deleteRestaurantReview(restaurantId, reviewId),
    onSuccess: () => refreshAfterRating(queryClient, restaurantId),
  });
}

/** POST /restaurants/:restaurantId/reviews/:reviewId/report */
export function useReportRestaurantReview(restaurantId: string, reviewId: string) {
  return useMutation({
    mutationFn: (payload: ReportReviewPayload) =>
      reviewApi.reportRestaurantReview(restaurantId, reviewId, payload),
  });
}
