import type { Href } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import {
  Home,
  Search,
  ShoppingBag,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { fonts } from '@/constants/typography';

/** Space to leave above the floating tab bar on root tab screens. */
export const APP_BOTTOM_NAV_INSET = 96;

const ORANGE = '#F97316';
const IDLE_COLOR = '#9CA3AF';

type Tab = {
  key: string;
  label: string;
  href: Href;
  match: (pathname: string) => boolean;
  Icon: typeof Home;
  fillWhenActive?: boolean;
};

const TABS: Tab[] = [
  {
    key: 'home',
    label: 'Home',
    href: '/home',
    match: (p) => p === '/home' || p.endsWith('/home'),
    Icon: Home,
    fillWhenActive: true,
  },
  {
    key: 'search',
    label: 'Search',
    href: '/search',
    match: (p) => p === '/search' || p.endsWith('/search'),
    Icon: Search,
  },
  {
    key: 'orders',
    label: 'Orders',
    href: '/orders',
    match: (p) => p.startsWith('/orders'),
    Icon: ShoppingBag,
  },
  {
    key: 'wallet',
    label: 'Wallet',
    href: '/profile/wallet',
    match: (p) => p.includes('/wallet'),
    Icon: Wallet,
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/profile',
    match: (p) =>
      (p === '/profile' || p.endsWith('/profile')) && !p.includes('/wallet'),
    Icon: UserRound,
  },
];

function isCartPath(pathname: string) {
  return pathname === '/cart' || pathname.endsWith('/cart');
}

function isFavoritesPath(pathname: string) {
  return pathname === '/favorites' || pathname.endsWith('/favorites');
}

function isRestaurantsPath(pathname: string) {
  return pathname === '/restaurants' || /\/restaurants\/?$/.test(pathname);
}

export function isAppTabRoot(pathname: string): boolean {
  const path = pathname.split('?')[0] ?? pathname;
  if (isCartPath(path)) return false;
  return (
    isRestaurantsPath(path) ||
    isFavoritesPath(path) ||
    TABS.some((tab) => tab.match(path))
  );
}

function TabButton({
  tab,
  active,
  onPress,
}: {
  tab: Tab;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(active ? 1 : 0.96);
  const Icon = tab.Icon;

  useEffect(() => {
    scale.value = withSpring(active ? 1 : 0.96, {
      damping: 16,
      stiffness: 280,
      mass: 0.5,
    });
  }, [active, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: active ? 1 : 0.88,
  }));

  return (
    <SmoothPressable
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      onPress={onPress}
      style={styles.tab}
      pressScale={0.92}
      haptic="selection"
    >
      <Animated.View style={[styles.tabInner, animStyle]}>
        <View style={[styles.iconSlot, active && styles.iconSlotActive]}>
          <Icon
            color={active ? ORANGE : IDLE_COLOR}
            size={22}
            strokeWidth={active ? 2.5 : 1.9}
            fill={active && tab.fillWhenActive ? ORANGE : 'transparent'}
          />
        </View>
        <Text
          style={[styles.tabLabel, active && styles.tabLabelActive]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </SmoothPressable>
  );
}

export function AppBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const path = pathname.split('?')[0] ?? pathname;
  if (!isAppTabRoot(path)) return null;

  const go = (href: Href) => {
    router.replace(href);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, 10) + 8 },
      ]}
    >
      <View style={styles.bar}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            active={tab.match(path)}
            onPress={() => go(tab.href)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    zIndex: 50,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#F3E8DE',
    shadowColor: '#B4541A',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  iconSlot: {
    width: 46,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotActive: {
    backgroundColor: '#FFF1E6',
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: fonts.uiMedium,
    color: IDLE_COLOR,
  },
  tabLabelActive: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
  },
});
