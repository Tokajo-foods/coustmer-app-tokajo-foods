import type {
  PaginationMeta,
  RatingDistribution,
  RestaurantReview,
  ReviewOwnerReply,
  ReviewStats,
} from '@/lib/review/types';

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

export function extractList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  const nested =
    record.reviews ??
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

export function extractMeta(
  data: unknown,
  envelopeMeta?: PaginationMeta
): PaginationMeta | undefined {
  if (envelopeMeta) return envelopeMeta;
  if (!data || typeof data !== 'object') return undefined;
  const record = data as Record<string, unknown>;
  if (record.meta && typeof record.meta === 'object') {
    return record.meta as PaginationMeta;
  }
  const total = typeof record.total === 'number' ? record.total : undefined;
  const page = typeof record.page === 'number' ? record.page : undefined;
  const limit = typeof record.limit === 'number' ? record.limit : undefined;
  const totalPages =
    typeof record.totalPages === 'number' ? record.totalPages : undefined;
  const hasNext =
    typeof record.hasNext === 'boolean' ? record.hasNext : undefined;
  if (
    total === undefined &&
    page === undefined &&
    limit === undefined &&
    totalPages === undefined
  ) {
    return undefined;
  }
  return { total, page, limit, totalPages, hasNext };
}

export function clampRating(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, Math.round(n)));
}

/** Ensure a 1–5 int for review-service Zod (coerce of undefined → NaN). */
export function requireStarRating(value: unknown, label = 'rating'): number {
  const n = clampRating(value);
  if (n < 1 || n > 5) {
    throw new Error(`Please select a ${label} from 1 to 5 stars.`);
  }
  return n;
}

export function mapDishRatings(
  dishes: Array<{ itemId: string; rating: number }> | undefined
): Array<{ itemId: string; rating: number }> | undefined {
  if (!dishes?.length) return undefined;
  return dishes
    .map((d) => ({
      itemId: String(d.itemId ?? '').trim(),
      rating: requireStarRating(d.rating, 'dish rating'),
    }))
    .filter((d) => d.itemId.length > 0);
}

function mapReply(raw: Record<string, unknown>): ReviewOwnerReply | undefined {
  const replyObj =
    raw.reply && typeof raw.reply === 'object'
      ? (raw.reply as Record<string, unknown>)
      : undefined;

  const text = String(
    replyObj?.text ??
      replyObj?.comment ??
      replyObj?.message ??
      raw.ownerReply ??
      raw.restaurantReply ??
      raw.replyText ??
      (typeof raw.reply === 'string' ? raw.reply : '') ??
      ''
  ).trim();

  if (!text) return undefined;

  return {
    text,
    repliedAt:
      (replyObj?.repliedAt as string) ||
      (replyObj?.createdAt as string) ||
      (raw.repliedAt as string) ||
      undefined,
    repliedBy:
      (replyObj?.repliedBy as string) ||
      (replyObj?.author as string) ||
      (raw.repliedBy as string) ||
      'Restaurant',
  };
}

export function mapReview(raw: Record<string, unknown>): RestaurantReview {
  const user =
    raw.user && typeof raw.user === 'object'
      ? (raw.user as Record<string, unknown>)
      : undefined;

  return {
    id: String(raw._id ?? raw.id ?? ''),
    restaurantId: raw.restaurantId
      ? String(raw.restaurantId)
      : raw.restaurant
        ? String(raw.restaurant)
        : undefined,
    orderId: raw.orderId
      ? String(raw.orderId)
      : raw.order
        ? String(raw.order)
        : undefined,
    userId: raw.userId
      ? String(raw.userId)
      : user?.id
        ? String(user.id)
        : user?._id
          ? String(user._id)
          : undefined,
    userName:
      (raw.userName as string) ||
      (raw.customerName as string) ||
      (user?.name as string) ||
      ([user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
        undefined) ||
      (raw.name as string) ||
      undefined,
    rating: clampRating(raw.rating ?? raw.stars ?? raw.score),
    comment:
      (raw.comment as string) ||
      (raw.review as string) ||
      (raw.text as string) ||
      (raw.body as string) ||
      undefined,
    title: (raw.title as string) || undefined,
    photos: Array.isArray(raw.photos)
      ? raw.photos.map((p) => String(p)).filter(Boolean)
      : Array.isArray(raw.images)
        ? raw.images.map((p) => String(p)).filter(Boolean)
        : undefined,
    reply: mapReply(raw),
    createdAt:
      (raw.createdAt as string) ||
      (raw.created_at as string) ||
      undefined,
    updatedAt:
      (raw.updatedAt as string) ||
      (raw.updated_at as string) ||
      undefined,
  };
}

export function emptyDistribution(): RatingDistribution {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

export function mapStats(data: unknown): ReviewStats {
  const record = asRecord(data);
  const distRaw = asRecord(
    record.distribution ??
      record.ratingDistribution ??
      record.breakdown ??
      record.ratingBreakdown ??
      {}
  );

  const distribution = emptyDistribution();
  ([1, 2, 3, 4, 5] as const).forEach((star) => {
    const value =
      distRaw[String(star)] ??
      distRaw[`${star}star`] ??
      distRaw[`${star}Star`] ??
      distRaw[`star${star}`];
    distribution[star] = Number(value) || 0;
  });

  // Some APIs nest counts as array [{star:5,count:10}, ...]
  if (
    Array.isArray(record.distribution) ||
    Array.isArray(record.ratingDistribution)
  ) {
    const arr = (record.distribution ??
      record.ratingDistribution) as unknown[];
    for (const row of arr) {
      const item = asRecord(row);
      const star = clampRating(item.star ?? item.rating ?? item.stars);
      const count = Number(item.count ?? item.total ?? 0) || 0;
      if (star >= 1 && star <= 5) {
        distribution[star as 1 | 2 | 3 | 4 | 5] = count;
      }
    }
  }

  const avgRaw = Number(record.avgRating ?? record.average ?? record.averageRating ?? 0);
  const average = Number.isFinite(avgRaw) ? Math.min(5, Math.max(0, Math.round(avgRaw * 10) / 10)) : 0;
  const total =
    Number(record.totalRatings ?? record.totalReviews ?? record.total ?? record.count ?? 0) || 0;

  return {
    average,
    total,
    writtenReviews: Number(record.writtenReviews ?? 0) || 0,
    distribution,
  };
}
