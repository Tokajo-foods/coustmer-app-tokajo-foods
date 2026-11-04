import type { Href } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import {
  Home,
  Search,
  ShoppingBag,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { GlassSurface } from '@/components/navigation/GlassSurface';
import { fonts } from '@/constants/typography';

/** Space to leave above the floating tab bar on root tab screens. */
export const APP_BOTTOM_NAV_INSET = 96;

export const APP_BOTTOM_NAV_HEIGHT = 64;

/** Distance from the screen bottom to the bottom edge of the floating tab bar. */
export function appBottomNavOffset(safeAreaBottom: number): number {
  return Math.max(safeAreaBottom, 10) + 6;
}

const ORANGE = '#F97316';
const IDLE_COLOR = '#6B7280';

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

function isOrderArrivalPath(pathname: string) {
  return /\/orders\/[^/]+\/(tracking|restaurant-chat)\/?$/.test(pathname);
}

function isFavoritesPath(pathname: string) {
  return pathname === '/favorites' || pathname.endsWith('/favorites');
}

function isRestaurantsPath(pathname: string) {
  return pathname === '/restaurants' || /\/restaurants\/?$/.test(pathname);
}

export function isAppTabRoot(pathname: string): boolean {
  const path = pathname.split('?')[0] ?? pathname;
  if (isCartPath(path) || isOrderArrivalPath(path)) return false;
  return (
    isRestaurantsPath(path) ||
    isFavoritesPath(path) ||
    TABS.some((tab) => tab.match(path))
  );
}

/** Main tabs — floating “Track order” pill when a live order exists. */
export function isHomePath(pathname: string): boolean {
  const path = (pathname.split('?')[0] ?? pathname).replace(/\/$/, '');
  return path === '/home' || path.endsWith('/home');
}

const SPRING = { damping: 18, stiffness: 240, mass: 0.6 };

function TabButton({
  tab,
  active,
  onPress,
}: {
  tab: Tab;
  active: boolean;
  onPress: () => void;
}) {
  const lift = useSharedValue(active ? 1 : 0);
  const Icon = tab.Icon;

  useEffect(() => {
    lift.value = withSpring(active ? 1 : 0, SPRING);
  }, [active, lift]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -1.5 * lift.value },
      { scale: 0.96 + 0.08 * lift.value },
    ],
  }));

  return (
    <SmoothPressable
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      onPress={onPress}
      style={styles.tab}
      pressScale={0.9}
      haptic="selection"
    >
      <View style={styles.tabInner}>
        <Animated.View style={iconStyle}>
          <Icon
            color={active ? ORANGE : IDLE_COLOR}
            size={21}
            strokeWidth={active ? 2.3 : 1.8}
            fill={active && tab.fillWhenActive ? 'rgba(249,115,22,0.18)' : 'transparent'}
          />
        </Animated.View>
        <Text
          style={[styles.tabLabel, active && styles.tabLabelActive]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      </View>
    </SmoothPressable>
  );
}

function ActiveIndicator({ index, tabWidth }: { index: number; tabWidth: number }) {
  const x = useSharedValue(index * tabWidth);
  const visible = index >= 0 && tabWidth > 0;

  useEffect(() => {
    if (visible) x.value = withSpring(index * tabWidth, SPRING);
  }, [index, tabWidth, visible, x]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.indicatorSlot, { width: tabWidth }, style]}
    >
      <View style={styles.indicator} />
    </Animated.View>
  );
}

export function AppBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [rowWidth, setRowWidth] = useState(0);

  const path = pathname.split('?')[0] ?? pathname;
  if (!isAppTabRoot(path)) return null;

  const activeIndex = TABS.findIndex((tab) => tab.match(path));
  const tabWidth = Math.max(0, rowWidth - ROW_PADDING * 2) / TABS.length;

  const onRowLayout = (e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: appBottomNavOffset(insets.bottom) },
      ]}
    >
      <GlassSurface radius={BAR_RADIUS} translucent>
        <View style={styles.row} onLayout={onRowLayout}>
          <ActiveIndicator index={activeIndex} tabWidth={tabWidth} />
          {TABS.map((tab, i) => (
            <TabButton
              key={tab.key}
              tab={tab}
              active={i === activeIndex}
              onPress={() => router.replace(tab.href)}
            />
          ))}
        </View>
      </GlassSurface>
    </View>
  );
}

const BAR_RADIUS = 28;
const ROW_PADDING = 6;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 46,
    right: 46,
    bottom: 0,
    zIndex: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: APP_BOTTOM_NAV_HEIGHT,
    padding: ROW_PADDING,
  },
  indicatorSlot: {
    position: 'absolute',
    top: ROW_PADDING,
    bottom: ROW_PADDING,
    left: ROW_PADDING,
    paddingHorizontal: 4,
  },
  indicator: {
    flex: 1,
    borderRadius: BAR_RADIUS - ROW_PADDING,
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.18)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 7,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    fontFamily: fonts.uiMedium,
    color: IDLE_COLOR,
  },
  tabLabelActive: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
  },
});
