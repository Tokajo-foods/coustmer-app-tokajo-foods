import { Search, SlidersHorizontal } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { fonts } from '@/constants/typography';
import { SEARCH_MORPH } from '@/lib/motion/search-morph';
import type { SearchMorph } from '@/lib/motion/use-search-morph';

import { StaticPlaceholder } from './RotatingPlaceholder';
import { SEARCH_PLACEHOLDER, searchColors } from './search-styles';

const { from: A, to: B } = SEARCH_MORPH;

/**
 * The pill that travels from the home search dock to the search bar. It starts as an
 * exact copy of the dock and lands as an exact copy of the bar, then hands over.
 */
export function SearchMorphGhost({ morph }: { morph: SearchMorph }) {
  const { progress, from, to } = morph;

  const shell = useAnimatedStyle(() => {
    const a = from.value;
    const b = to.value;
    if (!a || !b) return { opacity: 0 };
    const p = progress.value;
    return {
      opacity: interpolate(p, [0.85, 1], [1, 0], 'clamp'),
      left: interpolate(p, [0, 1], [a.x, b.x]),
      top: interpolate(p, [0, 1], [a.y, b.y]),
      width: interpolate(p, [0, 1], [a.width, b.width]),
      height: interpolate(p, [0, 1], [a.height, b.height]),
      borderRadius: interpolate(p, [0, 1], [A.radius, B.radius]),
      backgroundColor: interpolateColor(p, [0, 1], [A.bg, B.bg]),
      borderColor: interpolateColor(p, [0, 1], [A.border, B.border]),
      shadowOpacity: interpolate(p, [0, 1], [A.shadow, B.shadow]),
      elevation: interpolate(p, [0, 1], [A.elevation, B.elevation]),
    };
  });

  const iconBox = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      width: interpolate(p, [0, 1], [36, 16]),
      height: interpolate(p, [0, 1], [36, 16]),
      borderRadius: interpolate(p, [0, 1], [12, 0]),
      marginRight: interpolate(p, [0, 1], [11, 8]),
      backgroundColor: interpolateColor(p, [0, 0.7], ['#FFF1E6', 'rgba(255,241,230,0)']),
      transform: [{ scale: interpolate(p, [0, 1], [18 / 16, 1]) }],
    };
  });
  const hintOut = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.5], [1, 0], 'clamp') }));
  const hintIn = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0.3, 0.9], [0, 1], 'clamp') }));
  const trailing = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.3], [1, 0], 'clamp') }));

  if (!morph.hasOrigin) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.shell, shell]}>
      <Animated.View style={[styles.iconBox, iconBox]}>
        <Search color={searchColors.orange} size={16} strokeWidth={2.6} />
      </Animated.View>
      <View style={styles.texts}>
        <Animated.Text style={[styles.hint, hintOut]} numberOfLines={1}>
          {morph.hint || SEARCH_PLACEHOLDER}
        </Animated.Text>
        <Animated.View style={[StyleSheet.absoluteFill, styles.center, hintIn]}>
          <StaticPlaceholder />
        </Animated.View>
      </View>
      <Animated.View style={[styles.trailing, trailing]}>
        <View style={styles.divider} />
        <SlidersHorizontal color={searchColors.orange} size={18} strokeWidth={2.4} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    shadowColor: '#B4541A',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 20,
    overflow: 'hidden',
  },
  iconBox: { alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, justifyContent: 'center' },
  center: { justifyContent: 'center' },
  hint: { fontFamily: fonts.ui, fontSize: 14.5, color: '#8A8A8A' },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: 11, position: 'absolute', right: 12 },
  divider: { width: 1, height: 24, backgroundColor: '#EFEAE4' },
});
