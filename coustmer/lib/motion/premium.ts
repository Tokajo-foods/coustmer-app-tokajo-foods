import { Platform } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Shared scroll / list tuning for a Zomato-style premium feel.
 * Apply on FlatList / ScrollView across customer screens.
 */
export const PREMIUM_SCROLL = {
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  scrollEventThrottle: 16,
  decelerationRate: Platform.OS === 'ios' ? ('normal' as const) : 0.985,
  overScrollMode: 'never' as const,
  bounces: true,
  alwaysBounceVertical: false,
  keyboardShouldPersistTaps: 'handled' as const,
};

/** FlatList virtualization defaults — smooth long feeds without jank. */
export const PREMIUM_LIST = {
  ...PREMIUM_SCROLL,
  removeClippedSubviews: Platform.OS === 'android',
  initialNumToRender: 6,
  maxToRenderPerBatch: 8,
  windowSize: 9,
  updateCellsBatchingPeriod: 40,
  onEndReachedThreshold: 0.45,
};

/** Horizontal rails (dishes / restaurants). */
export const PREMIUM_HORIZONTAL_LIST = {
  showsHorizontalScrollIndicator: false,
  scrollEventThrottle: 16,
  decelerationRate: Platform.OS === 'ios' ? ('fast' as const) : 0.92,
  removeClippedSubviews: Platform.OS === 'android',
  initialNumToRender: 4,
  maxToRenderPerBatch: 4,
  windowSize: 5,
};

/** In-app stack transitions — snappy push / interactive pop. */
export const PREMIUM_STACK_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: 280,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  animationMatchesGesture: true,
  animationTypeForReplace: 'push',
  contentStyle: { backgroundColor: '#FFFFFF' },
};

export const PREMIUM_MODAL_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_bottom',
  animationDuration: 320,
  gestureEnabled: true,
  presentation: 'modal',
  contentStyle: { backgroundColor: '#FFFFFF' },
};

export const PREMIUM_FADE_OPTIONS: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  animationDuration: 220,
  gestureEnabled: true,
  contentStyle: { backgroundColor: 'transparent' },
};
