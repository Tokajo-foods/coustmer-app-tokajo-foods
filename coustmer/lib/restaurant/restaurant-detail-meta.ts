import {
  formatNextOpenAt,
  restaurantDutyLabel,
  restaurantRatingCount,
  restaurantStars,
} from '@/lib/restaurant/card-display';
import type { Restaurant } from '@/lib/restaurant/types';

const positive = (n: unknown): number | null => (typeof n === 'number' && n > 0 ? n : null);

/** Rating, open status and hygiene labels for the restaurant page. */
export function restaurantDetailMeta(input: {
  restaurant: Restaurant;
  reviewStats?: { average: number; total: number } | null;
  histogram?: { avgRating?: number | null; totalRatings?: number | null } | null;
  timings?: { isOpenNow?: boolean | null; nextOpenAt?: string | null } | null;
  timingsLoading: boolean;
  hygiene?: { hygieneScore?: number | null; fssaiLicense?: string | null } | null;
}) {
  const { restaurant: r, reviewStats, histogram, timings, hygiene } = input;

  const stars = positive(reviewStats?.average) ?? positive(histogram?.avgRating) ?? restaurantStars(r) ?? null;
  const count = positive(reviewStats?.total) ?? positive(histogram?.totalRatings) ?? restaurantRatingCount(r) ?? null;

  const dutyLabel = restaurantDutyLabel(r);
  const accepting = !dutyLabel && r.isOnline === true;
  const timingsOpen = dutyLabel ? false : timings?.isOpenNow;
  const dtoOpen = dutyLabel ? false : r.isOpenNow ?? r.isOpen ?? r.isOnline;
  const openNow = accepting
    ? true
    : typeof timingsOpen === 'boolean'
      ? timingsOpen
      : typeof dtoOpen === 'boolean'
        ? dtoOpen
        : undefined;

  const hygieneScore =
    typeof hygiene?.hygieneScore === 'number' ? hygiene.hygieneScore
      : typeof r.hygieneScore === 'number' ? r.hygieneScore : undefined;
  const showHygieneScore = typeof hygieneScore === 'number' && hygieneScore > 0;
  const fssai = (hygiene?.fssaiLicense ?? r.fssaiLicense ?? '').trim() || undefined;

  return {
    ratingText: typeof stars === 'number' && stars > 0 ? stars.toFixed(1) : null,
    reviewsCount: typeof count === 'number' && count > 0 ? `${count}` : null,
    dutyLabel,
    openNow,
    openStatusLoading: input.timingsLoading && openNow === undefined,
    kitchenClosed: openNow === false,
    kitchenOpen: openNow === true,
    nextOpenLabel: accepting ? null : formatNextOpenAt(timings?.nextOpenAt || r.nextOpenAt),
    hygieneScore,
    showHygieneScore,
    fssai,
    showFssaiOrHygiene: Boolean(fssai) || showHygieneScore,
  };
}
