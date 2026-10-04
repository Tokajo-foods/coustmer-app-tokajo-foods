import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Shared scroll / list tuning for a Zomato-style premium feel.
 * Apply on FlatList / ScrollView across customer screens.
 */
export const PREMIUM_SCROLL = {
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  scrollEventThrottle: 64,
  directionalLockEnabled: true,
  decelerationRate: 'fast' as const,
  overScrollMode: 'never' as const,
  bounces: true,
  alwaysBounceVertical: false,
  keyboardDismissMode: 'on-drag' as const,
  keyboardShouldPersistTaps: 'handled' as const,
};

/** FlatList virtualization defaults — smooth long feeds without jank. */
export const PREMIUM_LIST = {
  ...PREMIUM_SCROLL,
  // Clipping image cards on Android makes rows pop in and the scroll hitch.
  removeClippedSubviews: false,
  initialNumToRender: 6,
  maxToRenderPerBatch: 8,
  windowSize: 11,
  updateCellsBatchingPeriod: 16,
  onEndReachedThreshold: 0.6,
};

/**
 * Home vertical feed — keep the render window tight (big image cards)
 * so scroll stays on the UI thread and battery stays cooler.
 */
export const HOME_FEED_LIST = {
  ...PREMIUM_LIST,
};

/** Horizontal rails (dishes / restaurants) nested inside home header. */
export const PREMIUM_HORIZONTAL_LIST = {
  showsHorizontalScrollIndicator: false,
  scrollEventThrottle: 64,
  directionalLockEnabled: true,
  decelerationRate: 'fast' as const,
  removeClippedSubviews: false,
  initialNumToRender: 4,
  maxToRenderPerBatch: 4,
  windowSize: 5,
  nestedScrollEnabled: true,
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
