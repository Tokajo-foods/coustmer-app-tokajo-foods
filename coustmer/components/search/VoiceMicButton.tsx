import { Mic } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { searchColors } from './search-styles';

type Props = { listening: boolean; onPress: () => void };

const SIZE = 30;

/** Mic inside the search field; pulses while the recognizer is listening. */
export function VoiceMicButton({ listening, onPress }: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (listening) {
      pulse.value = 0;
      pulse.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }), -1, false);
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: 150 });
    }
  }, [listening, pulse]);

  const ring = useAnimatedStyle(() => ({
    opacity: listening ? 0.45 * (1 - pulse.value) : 0,
    transform: [{ scale: 1 + pulse.value * 0.8 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={listening ? 'Stop voice search' : 'Search by voice'}
      accessibilityState={{ selected: listening }}
    >
      <View style={styles.wrap}>
        <Animated.View pointerEvents="none" style={[styles.ring, ring]} />
        <View style={[styles.btn, listening && styles.btnOn]}>
          <Mic color={listening ? '#FFFFFF' : searchColors.fieldIcon} size={17} strokeWidth={2.2} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZE / 2,
    backgroundColor: searchColors.orange,
  },
  btn: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  btnOn: { backgroundColor: searchColors.orange },
});
