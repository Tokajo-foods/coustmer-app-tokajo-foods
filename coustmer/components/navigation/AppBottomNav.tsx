import { Pressable } from '@/components/common/Pressable';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/constants/typography';

/** Space to leave above the floating tab bar on root tab screens. */
export const APP_BOTTOM_NAV_INSET = 80;

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
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 6) }]}
    >
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const active = tab.match(path);
          const Icon = tab.Icon;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              onPress={() => go(tab.href)}
              style={styles.tab}
            >
              <Icon
                color={active ? ORANGE : IDLE_COLOR}
                size={23}
                strokeWidth={active ? 2.5 : 1.9}
                fill={active && tab.fillWhenActive ? ORANGE : 'transparent'}
              />
              <Text
                style={[styles.tabLabel, active && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: '#FFFFFF',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#0B1220',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 18,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 2,
    minWidth: 52,
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
