import { Pressable } from '@/components/common/Pressable';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { fonts } from '@/constants/typography';
import { RESTAURANT_MOTION_EASE, RESTAURANT_TAB_FADE_MS } from '@/lib/motion/restaurant-detail-motion';

const INK = '#0B1220';
const MUTED = '#94A3B8';

export type RestaurantDetailTab = 'Menu' | 'Reviews' | 'Info' | 'Offers';

const TABS: RestaurantDetailTab[] = ['Menu', 'Offers', 'Reviews', 'Info'];

type Props = {
  active: RestaurantDetailTab;
  onChange: (tab: RestaurantDetailTab) => void;
};

export function RestaurantDetailTabs({ active, onChange }: Props) {
  const activeIndex = TABS.indexOf(active);
  const indicatorX = useSharedValue(activeIndex);
  const tabWidth = useSharedValue(0);

  useEffect(() => {
    indicatorX.value = withTiming(activeIndex, {
      duration: RESTAURANT_TAB_FADE_MS,
      easing: RESTAURANT_MOTION_EASE,
    });
  }, [activeIndex, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth.value,
    transform: [{ translateX: indicatorX.value * tabWidth.value }],
  }));

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => {
        const inner = e.nativeEvent.layout.width - 8;
        tabWidth.value = inner / TABS.length;
      }}
    >
      <View style={styles.track} pointerEvents="none">
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      </View>
      {TABS.map((t) => {
        const on = active === t;
        return (
          <Pressable
            key={t}
            style={styles.tab}
            onPress={() => onChange(t)}
          >
            <Text style={[styles.tabText, on && styles.tabTextOn]}>{t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    paddingHorizontal: 4,
    paddingVertical: 4,
    position: 'relative',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  tabText: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: MUTED,
  },
  tabTextOn: {
    fontFamily: fonts.uiBold,
    color: INK,
  },
});
