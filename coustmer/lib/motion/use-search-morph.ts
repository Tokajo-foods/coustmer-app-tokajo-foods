import { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Keyboard, View, type ViewStyle } from 'react-native';
import {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type AnimatedStyle as RNAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import {
  SEARCH_MORPH,
  setSearchSourceHidden,
  takeSearchOrigin,
  type MorphRect,
} from '@/lib/motion/search-morph';

type AnimatedStyle = RNAnimatedStyle<ViewStyle>;

export type SearchMorph = {
  progress: SharedValue<number>;
  hasOrigin: boolean;
  from: SharedValue<MorphRect | null>;
  to: SharedValue<MorphRect | null>;
  hint: string;
  rootRef: React.RefObject<View | null>;
  targetRef: React.RefObject<View | null>;
  onTargetLayout: () => void;
  close: (after: () => void) => void;
  backdropStyle: AnimatedStyle;
  barStyle: AnimatedStyle;
  backStyle: AnimatedStyle;
  bodyStyle: AnimatedStyle;
};

function measure(view: View | null): Promise<MorphRect | null> {
  return new Promise((resolve) => {
    if (!view) return resolve(null);
    view.measureInWindow((x, y, width, height) => resolve(width > 0 ? { x, y, width, height } : null));
  });
}

function relative(rect: MorphRect, root: MorphRect): MorphRect {
  return { ...rect, x: rect.x - root.x, y: rect.y - root.y };
}

/**
 * Drives the home pill → search bar morph. Progress 0 is the home screen, 1 is search.
 * Without a recorded origin the page still fades and slides in.
 */
export function useSearchMorph(onOpened: () => void): SearchMorph {
  const reduced = useReducedMotion();
  const origin = useRef(takeSearchOrigin()).current;
  const progress = useSharedValue(0);
  const from = useSharedValue<MorphRect | null>(null);
  const to = useSharedValue<MorphRect | null>(null);
  const rootRef = useRef<View>(null);
  const targetRef = useRef<View>(null);
  const started = useRef(false);
  const closing = useRef(false);
  const hasOrigin = Boolean(origin) && !reduced;

  const open = useCallback(() => {
    if (reduced) {
      progress.value = 1;
      onOpened();
      return;
    }
    progress.value = withTiming(1, { duration: SEARCH_MORPH.openMs, easing: SEARCH_MORPH.openEasing }, (done) => {
      if (done) runOnJS(onOpened)();
    });
  }, [onOpened, progress, reduced]);

  const onTargetLayout = useCallback(() => {
    if (started.current) return;
    started.current = true;
    requestAnimationFrame(() => {
      void Promise.all([measure(rootRef.current), measure(targetRef.current)]).then(([root, bar]) => {
        if (root && bar && origin) {
          from.value = relative(origin.rect, root);
          to.value = relative(bar, root);
          setSearchSourceHidden(true);
        }
        open();
      });
    });
  }, [from, open, origin, to]);

  useEffect(() => () => setSearchSourceHidden(false), []);

  const close = useCallback((after: () => void) => {
    if (closing.current) return;
    closing.current = true;
    Keyboard.dismiss();
    const finish = () => {
      setSearchSourceHidden(false);
      after();
    };
    if (reduced) {
      finish();
      return;
    }
    progress.value = withTiming(0, { duration: SEARCH_MORPH.closeMs, easing: SEARCH_MORPH.closeEasing }, (done) => {
      if (done) runOnJS(finish)();
    });
  }, [progress, reduced]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6], [0, 1], 'clamp'),
  }));
  const barStyle = useAnimatedStyle(() => {
    if (hasOrigin && from.value && to.value) {
      return { opacity: interpolate(progress.value, [0.85, 1], [0, 1], 'clamp'), transform: [{ translateY: 0 }] };
    }
    return {
      opacity: interpolate(progress.value, [0.2, 1], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(progress.value, [0, 1], [-10, 0]) }],
    };
  });
  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.35, 1], [0, 1], 'clamp'),
    transform: [{ translateX: interpolate(progress.value, [0.35, 1], [-10, 0], 'clamp') }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.45, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(progress.value, [0.45, 1], [14, 0], 'clamp') }],
  }));

  return {
    progress,
    hasOrigin,
    from,
    to,
    hint: origin?.hint ?? '',
    rootRef,
    targetRef,
    onTargetLayout,
    close,
    backdropStyle,
    barStyle,
    backStyle,
    bodyStyle,
  };
}

/** Android back plays the morph in reverse before leaving. */
export function useMorphBackHandler(close: SearchMorph['close'], leave: () => void): void {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close(leave);
      return true;
    });
    return () => sub.remove();
  }, [close, leave]);
}
