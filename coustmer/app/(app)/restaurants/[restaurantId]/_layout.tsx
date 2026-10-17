import { Stack } from 'expo-router';

import { PREMIUM_STACK_OPTIONS } from '@/lib/motion/premium';

/** Outlet menu + nested offers (same pattern as orders/[orderId]). */
export default function RestaurantOutletLayout() {
  return (
    <Stack
      screenOptions={{
        ...PREMIUM_STACK_OPTIONS,
        headerShown: false,
      }}
    />
  );
}
