import { useEffect, useRef } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  RESTAURANT_FILTER_FADE_MS,
  RESTAURANT_MOTION_EASE,
  RESTAURANT_TAB_FADE_MS,
  RESTAURANT_TAB_SLIDE_PX,
} from '@/lib/motion/restaurant-detail-motion';

type Options = {
  /** `tab` uses slightly longer fade; `filter` is a touch quicker. */
  variant?: 'tab' | 'filter';
};

export function usePremiumContentFade(trigger: string, options?: Options) {
  const variant = options?.variant ?? 'tab';
  const duration =
    variant === 'filter' ? RESTAURANT_FILTER_FADE_MS : RESTAURANT_TAB_FADE_MS;
  const slide = variant === 'filter' ? 4 : RESTAURANT_TAB_SLIDE_PX;

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const skipNext = useRef(true);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    opacity.value = 0;
    translateY.value = slide;
    opacity.value = withTiming(1, {
      duration,
      easing: RESTAURANT_MOTION_EASE,
    });
    translateY.value = withTiming(0, {
      duration,
      easing: RESTAURANT_MOTION_EASE,
    });
  }, [trigger, duration, slide, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}
