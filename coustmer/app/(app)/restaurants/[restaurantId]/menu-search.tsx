import { Stack } from 'expo-router';

import { RestaurantMenuSearchScreen } from '@/components/restaurant/detail/RestaurantMenuSearchScreen';
import { PREMIUM_MODAL_OPTIONS } from '@/lib/motion/premium';

export default function RestaurantMenuSearchPage() {
  return (
    <>
      <Stack.Screen options={PREMIUM_MODAL_OPTIONS} />
      <RestaurantMenuSearchScreen />
    </>
  );
}
