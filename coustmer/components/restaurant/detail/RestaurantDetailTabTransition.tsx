import type { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePremiumContentFade } from '@/lib/motion/use-premium-content-fade';

import type { RestaurantDetailTab } from './RestaurantDetailTabs';

type Props = {
  tab: RestaurantDetailTab;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function RestaurantDetailTabTransition({ tab, style, children }: Props) {
  const animatedStyle = usePremiumContentFade(tab, { variant: 'tab' });

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}
