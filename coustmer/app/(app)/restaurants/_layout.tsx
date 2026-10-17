import { Stack } from 'expo-router';

import { PREMIUM_STACK_OPTIONS } from '@/lib/motion/premium';

export default function RestaurantsLayout() {
  return (
    <Stack
      screenOptions={{
        ...PREMIUM_STACK_OPTIONS,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="[restaurantId]/menu-search"
        options={{
          animation: 'slide_from_bottom',
          animationDuration: 320,
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
