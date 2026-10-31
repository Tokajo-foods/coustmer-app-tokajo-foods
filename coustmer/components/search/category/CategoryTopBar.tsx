import { ArrowLeft } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';
import { CATEGORY_HERO_BAR } from './CategoryHero';

type Props = {
  title: string;
  scrollY: SharedValue<number>;
  topInset: number;
  onBack: () => void;
};

/** Floating back button; fills white and shows the title once the hero scrolls away. */
export function CategoryTopBar({ title, scrollY, topInset, onBack }: Props) {
  const fill = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 110], [0, 1], Extrapolation.CLAMP),
  }));
  const label = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [90, 130], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [90, 130], [6, 0], Extrapolation.CLAMP) }],
  }));

  return (
    <View pointerEvents="box-none" style={[styles.root, { paddingTop: topInset, height: topInset + CATEGORY_HERO_BAR }]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.fill, fill]} />
      <SmoothPressable onPress={onBack} style={styles.back} pressScale={0.9} accessibilityLabel="Go back">
        <ArrowLeft color={searchColors.ink} size={21} strokeWidth={2.2} />
      </SmoothPressable>
      <Animated.View pointerEvents="none" style={[styles.titleWrap, label]}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  fill: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E4E7',
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titleWrap: { flex: 1 },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: searchColors.ink,
    textTransform: 'capitalize',
  },
});
