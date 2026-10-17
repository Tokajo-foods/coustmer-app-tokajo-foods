import { Easing, FadeIn } from 'react-native-reanimated';

/** Calm ease-out — no bounce (iOS-like). */
const EASE_OUT = Easing.bezier(0.33, 0, 0.2, 1);

/** Menu / Offers / Reviews / Info panel */
export const RESTAURANT_DETAIL_TAB_ENTERING = FadeIn.duration(240).easing(EASE_OUT);

/** Veg, non-veg, bestsellers, etc. */
export const RESTAURANT_MENU_FILTER_ENTERING = FadeIn.duration(200).easing(EASE_OUT);
