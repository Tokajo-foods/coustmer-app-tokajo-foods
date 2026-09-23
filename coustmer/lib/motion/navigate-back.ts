import type { Router } from 'expo-router';

/**
 * Premium back: pop when possible, else fall back to a safe route.
 * Pair with SmoothPressable (haptic) on the back button.
 */
export function navigateBack(
  router: Pick<Router, 'canGoBack' | 'back' | 'replace'>,
  fallback: string = '/home'
) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback as never);
}
