import React from 'react';
import {
  Pressable as NativePressable,
  Animated,
  type PressableProps,
} from 'react-native';

import { hapticLight } from '@/lib/utils/haptics';

const AnimatedNativePressable = Animated.createAnimatedComponent(NativePressable);

type Props = PressableProps & {
  /** Soft haptic on press (default false — use SmoothPressable for primary taps). */
  haptic?: boolean;
};

/**
 * Global Pressable with a soft opacity + scale press. Prefer SmoothPressable
 * for primary CTAs / cards; this keeps existing screens feeling premium.
 */
export const Pressable = React.forwardRef<unknown, Props>((props, ref) => {
  const { style, onPressIn, onPressOut, onPress, haptic, disabled, ...rest } =
    props;
  const opacity = React.useRef(new Animated.Value(1)).current;
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0.72,
        duration: 85,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 0.97,
        friction: 7,
        tension: 220,
        useNativeDriver: true,
      }),
    ]).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onPressOut?.(e);
  };

  const animatedStyle = { opacity, transform: [{ scale }] };
  const combinedStyle =
    typeof style === 'function'
      ? (state: Parameters<Extract<PressableProps['style'], Function>>[0]) => [
          style(state),
          animatedStyle,
        ]
      : [style, animatedStyle];

  return (
    <AnimatedNativePressable
      ref={ref as never}
      {...rest}
      disabled={disabled}
      onPress={(e) => {
        if (haptic && !disabled) hapticLight();
        onPress?.(e);
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={combinedStyle as PressableProps['style']}
    />
  );
});

Pressable.displayName = 'Pressable';
