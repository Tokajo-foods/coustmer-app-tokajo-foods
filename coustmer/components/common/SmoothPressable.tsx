import { type ReactNode } from 'react';
import {
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { hapticLight, hapticSelection } from '@/lib/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Scale when pressed (default 0.97). */
  pressScale?: number;
  hitSlop?: number;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'switch' | 'link' | 'none' | 'tab';
  /** Soft haptic on press (default true). */
  haptic?: boolean | 'light' | 'selection';
};

/**
 * Pressable with a soft spring scale + optional haptic.
 * Styles stay on the pressable so flex rows and flex:1 layouts work.
 */
export function SmoothPressable({
  children,
  onPress,
  disabled,
  style,
  pressScale = 0.97,
  hitSlop,
  accessibilityLabel,
  accessibilityRole = 'button',
  haptic = true,
}: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fireHaptic = () => {
    if (!haptic || disabled) return;
    if (haptic === 'selection') hapticSelection();
    else hapticLight();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={() => {
        fireHaptic();
        onPress?.();
      }}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      onPressIn={() => {
        scale.value = withTiming(pressScale, {
          duration: 85,
          easing: Easing.out(Easing.quad),
        });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 340, mass: 0.55 });
      }}
      style={[style, animStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
