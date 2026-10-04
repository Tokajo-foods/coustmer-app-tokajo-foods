import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { HERO_BANNER } from '@/components/home/tokajo/assets';
import type { HomeBanner } from '@/lib/customer/types';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';
import { subscribeFeedScrolling } from '@/lib/motion/scroll-activity';

const H_MARGIN = 16;
/** Matches `public/hero-banner.png` (763×254) so `cover` does not crop text. */
const BANNER_ASPECT = 763 / 254;
const AUTO_MS = 5500;
const WIDTH = Dimensions.get('window').width - H_MARGIN * 2;
const HEIGHT = Math.round(WIDTH / BANNER_ASPECT);

type Slide = { key: string; source: number | { uri: string }; deepLink?: string };

type Props = {
  banners?: HomeBanner[] | null;
};

/** Brand hero art + live API offer slides — pauses while feed scrolls / app backgrounds. */
export const TokajoHeroBanner = memo(function TokajoHeroBanner({
  banners,
}: Props) {
  const router = useRouter();

  const slides: Slide[] = useMemo(
    () => [
      { key: 'brand', source: HERO_BANNER },
      ...(banners ?? [])
        .filter((b) => b?.imageUrl)
        .map((b) => ({
          key: b.id || b.imageUrl!,
          source: { uri: b.imageUrl! },
          deepLink: b.deepLink,
        })),
    ],
    [banners]
  );

  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const appActiveRef = useRef(AppState.currentState === 'active');

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const schedule = useCallback(() => {
    clearTimer();
    if (slides.length <= 1) return;
    if (pausedRef.current || !appActiveRef.current) return;
    timer.current = setTimeout(() => {
      const next = (activeRef.current + 1) % slides.length;
      activeRef.current = next;
      setActive(next);
      scrollRef.current?.scrollTo({ x: next * WIDTH, animated: true });
      schedule();
    }, AUTO_MS);
  }, [clearTimer, slides.length]);

  useEffect(() => {
    schedule();
    return clearTimer;
  }, [schedule, clearTimer]);

  useEffect(() => {
    const unsub = subscribeFeedScrolling((scrolling) => {
      pausedRef.current = scrolling;
      if (scrolling) clearTimer();
      else schedule();
    });
    return unsub;
  }, [clearTimer, schedule]);

  useEffect(() => {
    const onAppState = (state: AppStateStatus) => {
      appActiveRef.current = state === 'active';
      if (state === 'active') schedule();
      else clearTimer();
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [clearTimer, schedule]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / WIDTH);
    activeRef.current = idx;
    setActive(idx);
    schedule();
  };

  const onPress = (slide: Slide) => {
    if (slide.deepLink) {
      try {
        router.push(slide.deepLink as never);
        return;
      } catch {
        /* fall through */
      }
    }
    router.push('/search');
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        {...PREMIUM_HORIZONTAL_LIST}
        onMomentumScrollEnd={onEnd}
        onScrollBeginDrag={clearTimer}
      >
        {slides.map((slide) => (
          <Pressable
            key={slide.key}
            style={styles.slide}
            onPress={() => onPress(slide)}
          >
            <Image
              source={slide.source}
              style={styles.image}
              contentFit="contain"
              transition={0}
              cachePolicy="memory-disk"
            />
          </Pressable>
        ))}
      </ScrollView>

      {slides.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {slides.map((s, i) => (
            <View
              key={s.key}
              style={[styles.dot, i === active && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: H_MARGIN,
    marginTop: -Math.round(HEIGHT * 0.07),
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F6D2B0',
  },
  slide: {
    width: WIDTH,
    height: HEIGHT,
    justifyContent: 'flex-end',
    backgroundColor: '#F6D2B0',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  dots: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
});
