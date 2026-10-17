import { ChevronsRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { fonts } from '@/constants/typography';
import { playHapticFeedback } from '@/lib/utils/haptics';

const HEIGHT = 56;
const PAD = 4;
const KNOB = HEIGHT - PAD * 2;
const COMPLETE_AT = 0.85;

type Props = {
  label: string;
  /** May return a promise; the knob snaps back when it settles (e.g. validation alert). */
  onConfirm: () => void | Promise<unknown>;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
};

/** Swipe the knob left → right to confirm; snaps back if released early or when `loading` ends. */
export function SlideToConfirm({ label, onConfirm, loading, disabled, color = '#F97316' }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const maxX = Math.max(0, trackWidth - KNOB - PAD * 2);
  const x = useSharedValue(0);
  const startX = useSharedValue(0);

  useEffect(() => {
    if (!loading) x.value = withSpring(0, { damping: 18, stiffness: 180 });
  }, [loading, x]);

  const confirm = () => {
    void playHapticFeedback();
    void Promise.resolve(onConfirm()).finally(() => {
      x.value = withSpring(0, { damping: 18, stiffness: 180 });
    });
  };

  const locked = Boolean(disabled || loading) || maxX === 0;

  const pan = Gesture.Pan()
    .enabled(!locked)
    .activeOffsetX(4)
    .onStart(() => {
      startX.value = x.value;
    })
    .onUpdate((e) => {
      x.value = Math.min(maxX, Math.max(0, startX.value + e.translationX));
    })
    .onEnd(() => {
      if (x.value >= maxX * COMPLETE_AT) {
        x.value = withTiming(maxX, { duration: 120 });
        runOnJS(confirm)();
      } else {
        x.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: x.value + KNOB + PAD }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: maxX > 0 ? interpolate(x.value, [0, maxX * 0.6], [1, 0]) : 1,
  }));

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View
      style={[styles.track, { backgroundColor: color }, disabled && styles.disabled]}
      onLayout={onLayout}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      ) : (
        <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
          {label}
        </Animated.Text>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.knob, knobStyle]}>
          <ChevronsRight color={color} size={24} strokeWidth={2.6} />
        </Animated.View>
      </GestureDetector>
      {!loading ? <Text style={styles.hint}>›››</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disabled: { opacity: 0.6 },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  label: {
    position: 'absolute',
    left: KNOB + PAD * 2,
    right: 36,
    textAlign: 'center',
    fontFamily: fonts.uiSemi,
    fontSize: 16,
    color: '#FFFFFF',
  },
  knob: {
    position: 'absolute',
    left: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  hint: {
    position: 'absolute',
    right: 18,
    fontFamily: fonts.uiSemi,
    fontSize: 18,
    color: 'rgba(255,255,255,0.55)',
  },
});
