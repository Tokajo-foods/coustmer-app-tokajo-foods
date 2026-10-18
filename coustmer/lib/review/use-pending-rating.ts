import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { orderApi } from '@/lib/order/api';
import { orderKeys } from '@/lib/order/hooks';
import { canRateOrder, type Order } from '@/lib/order/types';
import { useMyRestaurantRating } from '@/lib/review/hooks';
import { dismissRatingPrompt, loadDismissedRatingPrompts } from '@/lib/review/rating-prompt-store';

/** Only ask about orders delivered in the last 3 days. */
const PROMPT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const RECENT_PARAMS = { page: 1, limit: 5 };

export type PendingRating = {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  itemsSummary: string;
};

function deliveredRecently(order: Order): boolean {
  const at = Date.parse(String(order.deliveredAt ?? order.updatedAt ?? order.createdAt ?? ''));
  return Number.isFinite(at) && Date.now() - at <= PROMPT_WINDOW_MS;
}

function toPending(order: Order): PendingRating {
  const names = order.items.map((i) => i.name).filter(Boolean);
  const raw = order.raw ?? {};
  return {
    orderId: order.id,
    restaurantId: order.restaurantId ?? '',
    restaurantName: order.restaurantName || 'the restaurant',
    restaurantImage: (raw.restaurantImage as string) || (raw.restaurantLogo as string) || undefined,
    itemsSummary: names.slice(0, 2).join(', ') + (names.length > 2 ? ` +${names.length - 2} more` : ''),
  };
}

/**
 * The newest delivered order from a restaurant this customer has never rated, and not dismissed.
 * Refetches the recent orders every minute so a just-delivered order prompts without a restart.
 */
export function usePendingRating(enabled: boolean) {
  const [dismissed, setDismissed] = useState<string[] | null>(null);

  useEffect(() => {
    void loadDismissedRatingPrompts().then(setDismissed);
  }, []);

  const recent = useQuery({
    queryKey: orderKeys.list(RECENT_PARAMS),
    queryFn: () => orderApi.getOrders(RECENT_PARAMS),
    enabled: enabled && dismissed !== null,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const [ratedRestaurants, setRatedRestaurants] = useState<ReadonlySet<string>>(new Set());

  const candidate = useMemo(() => {
    if (!dismissed) return null;
    const skip = new Set(dismissed);
    const order = (recent.data?.orders ?? []).find(
      (o) =>
        canRateOrder(o.status) &&
        Boolean(o.restaurantId) &&
        !ratedRestaurants.has(o.restaurantId ?? '') &&
        !skip.has(o.id) &&
        deliveredRecently(o)
    );
    return order ? toPending(order) : null;
  }, [recent.data, dismissed, ratedRestaurants]);

  const mine = useMyRestaurantRating(candidate?.restaurantId ?? '', {
    enabled: enabled && Boolean(candidate),
  });
  const rated = mine.data?.rated === true;

  useEffect(() => {
    const id = candidate?.restaurantId;
    if (!rated || !id) return;
    setRatedRestaurants((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, [rated, candidate?.restaurantId]);

  const pending = candidate && mine.isSuccess && !rated ? candidate : null;

  const dismiss = useCallback(async (orderId: string) => {
    setDismissed(await dismissRatingPrompt(orderId));
  }, []);

  return { pending, dismiss };
}
