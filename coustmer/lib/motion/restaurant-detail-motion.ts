import { Easing, FadeIn } from 'react-native-reanimated';

/** Calm ease-out — no bounce. */
export const RESTAURANT_MOTION_EASE = Easing.bezier(0.33, 0, 0.2, 1);

export const RESTAURANT_TAB_FADE_MS = 280;
export const RESTAURANT_TAB_SLIDE_PX = 5;

export const RESTAURANT_FILTER_FADE_MS = 220;

/** Fallback for list remount (filter key). */
export const RESTAURANT_MENU_FILTER_ENTERING = FadeIn.duration(
  RESTAURANT_FILTER_FADE_MS
).easing(RESTAURANT_MOTION_EASE);
