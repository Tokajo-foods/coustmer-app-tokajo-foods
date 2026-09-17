import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { HERO_BANNER } from '@/components/home/tokajo/assets';
import { fonts } from '@/constants/typography';
import type { HomeBanner } from '@/lib/customer/types';

const ORANGE = '#F97316';
const H_MARGIN = 16;
const HEIGHT = 152;
const AUTO_MS = 4200;
const WIDTH = Dimensions.get('window').width - H_MARGIN * 2;

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
              contentFit="cover"
              transition={200}
            />
            <View style={styles.orderBtn}>
              <Text style={styles.orderText}>Order Now</Text>
              <ArrowRight color="#FFFFFF" size={14} strokeWidth={2.8} />
            </View>
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
  },
  slide: {
    width: WIDTH,
    height: HEIGHT,
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  orderBtn: {
    position: 'absolute',
    left: 18,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ORANGE,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  orderText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 13,
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
