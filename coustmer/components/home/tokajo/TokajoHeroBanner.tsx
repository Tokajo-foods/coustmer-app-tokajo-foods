import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
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

const H_MARGIN = 16;
/** Matches `public/hero-banner.png` (763×254) so `cover` does not crop text. */
const BANNER_ASPECT = 763 / 254;
const AUTO_MS = 4200;
const WIDTH = Dimensions.get('window').width - H_MARGIN * 2;
const HEIGHT = Math.round(WIDTH / BANNER_ASPECT);

type Slide = { key: string; source: number | { uri: string }; deepLink?: string };

type Props = {
  banners?: HomeBanner[] | null;
};

/** Brand hero art + live API offer slides, with Order Now + page dots. */
export function TokajoHeroBanner({ banners }: Props) {
  const router = useRouter();

  const slides: Slide[] = [
    { key: 'brand', source: HERO_BANNER },
    ...(banners ?? [])
      .filter((b) => b?.imageUrl)
      .map((b) => ({
        key: b.id || b.imageUrl!,
        source: { uri: b.imageUrl! },
        deepLink: b.deepLink,
      })),
  ];

  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (slides.length <= 1) return;
    timer.current = setTimeout(() => {
      const next = (activeRef.current + 1) % slides.length;
      activeRef.current = next;
      setActive(next);
      scrollRef.current?.scrollTo({ x: next * WIDTH, animated: true });
      schedule();
    }, AUTO_MS);
  }, [slides.length]);

  useEffect(() => {
    schedule();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [schedule]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / WIDTH);
    activeRef.current = idx;
    setActive(idx);
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
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        scrollEventThrottle={16}
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
              transition={200}
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
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: H_MARGIN,
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
