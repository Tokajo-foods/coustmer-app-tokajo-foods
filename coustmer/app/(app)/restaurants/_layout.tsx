import { Stack } from 'expo-router';

import { PREMIUM_STACK_OPTIONS } from '@/lib/motion/premium';

/** Nested restaurant menu, slug deep-links, and offers screens. */
export default function RestaurantsLayout() {
  return (
    <Stack
      screenOptions={{
        ...PREMIUM_STACK_OPTIONS,
        headerShown: false,
      }}
    />
  );
}
