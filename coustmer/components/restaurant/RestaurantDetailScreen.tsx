import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorView, LoadingView } from '@/components/common/StateViews';
import { CartFloatingBar } from '@/components/order/CartFloatingBar';
import { MenuItemDetailSheet } from '@/components/restaurant/MenuItemDetailSheet';
import { RestaurantShareSheet } from '@/components/restaurant/RestaurantShareSheet';
import { RestaurantCategoryRail } from '@/components/restaurant/detail/RestaurantCategoryRail';
import { RestaurantDetailTabTransition } from '@/components/restaurant/detail/RestaurantDetailTabTransition';
import { RestaurantDetailTabs, type RestaurantDetailTab } from '@/components/restaurant/detail/RestaurantDetailTabs';
import { RestaurantHero } from '@/components/restaurant/detail/RestaurantHero';
import { RestaurantInfoPanel } from '@/components/restaurant/detail/RestaurantInfoPanel';
import { RestaurantMenuSearchBar, type MenuFilterId } from '@/components/restaurant/detail/RestaurantMenuSearchBar';
import { RestaurantMenuSections } from '@/components/restaurant/detail/RestaurantMenuSections';
import { RestaurantOffersPanel } from '@/components/restaurant/detail/RestaurantOffersPanel';
import { RestaurantReviewsPanel } from '@/components/review/RestaurantReviewsPanel';
import { navigateBack } from '@/lib/motion/navigate-back';
import { PREMIUM_SCROLL } from '@/lib/motion/premium';
import { usePremiumContentFade } from '@/lib/motion/use-premium-content-fade';
import {
  formatDistanceKm,
  resolveRestaurantDistanceKm,
  restaurantDetailEtaLabel,
  restaurantOfferBadges,
} from '@/lib/restaurant/card-display';
import { openRestaurantMenuSearch } from '@/lib/restaurant/open-menu-search';
import { restaurantDetailMeta } from '@/lib/restaurant/restaurant-detail-meta';
import type { MenuItem } from '@/lib/restaurant/types';
import { useMenuDeepLink } from '@/lib/restaurant/use-menu-deep-link';
import { useRestaurantDetailData } from '@/lib/restaurant/use-restaurant-detail-data';
import { useRestaurantMenuGroups } from '@/lib/restaurant/use-restaurant-menu-groups';
import { useRestaurantShareGate } from '@/lib/restaurant/use-restaurant-share-gate';
import { useAuthStore } from '@/store/auth-store';
import { useDeliveryCoords } from '@/store/delivery-location-store';
import { useVegPreferenceStore } from '@/store/veg-preference-store';

const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export function RestaurantDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{
    restaurantId?: string;
    slug?: string;
    category?: string;
    categoryId?: string;
    itemId?: string;
    focus?: string;
    share?: string;
  }>();
  const shareFlag = one(params.share);
  const fromShare = shareFlag === '1' || shareFlag === 'true';

  const coords = useDeliveryCoords();
  const token = useAuthStore((s) => s.token);
  const vegMode = useVegPreferenceStore((s) => s.mode);
  const setVegMode = useVegPreferenceStore((s) => s.setMode);
  const vegOnly = vegMode === 'pure_veg';

  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});
  const menuOffsetY = useRef(0);
  const stickyRef = useRef(false);

  const [tab, setTab] = useState<RestaurantDetailTab>('Menu');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCat, setActiveCat] = useState<string>('popular');
  const [stickyCats, setStickyCats] = useState(false);
  const [menuFilter, setMenuFilter] = useState<MenuFilterId>(vegOnly ? 'veg' : 'all');
  const [shareOpen, setShareOpen] = useState(false);
  const menuFilterFadeStyle = usePremiumContentFade(menuFilter, { variant: 'filter' });

  const {
    id, restaurant, menu, reviewStats, timings, offers, holidays, specialHours, hygiene,
    ratingsHistogram, unavailableIds, alerts, notifyOpen,
  } = useRestaurantDetailData({
    idParam: one(params.restaurantId),
    slugParam: one(params.slug),
    coords,
    tab,
    signedIn: Boolean(token),
  });
  useRestaurantShareGate(restaurant.data, fromShare);

  const { grouped, categoryChips, categories } = useRestaurantMenuGroups({
    items: menu.items,
    recommended: menu.recommended,
    menuCategories: menu.categories,
    filter: menuFilter,
    vegOnly,
  });

  const jumpToCategory = (catId: string): boolean => {
    setActiveCat(catId);
    setTab('Menu');
    if (catId === 'popular') {
      scrollRef.current?.scrollTo({ y: 260, animated: true });
      return true;
    }
    const y = sectionY.current[catId];
    if (typeof y !== 'number') return false;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 56), animated: true });
    return true;
  };

  const { highlightedItemId } = useMenuDeepLink({
    restaurantId: id,
    items: menu.items,
    menuLoading: menu.isLoading,
    categories,
    focusItemId: one(params.itemId),
    focusCategoryId: one(params.categoryId),
    focusCategory: one(params.category),
    sectionOnly: one(params.focus) === 'section',
    jumpToCategory,
    onOpenItem: setSelectedItem,
  });

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = e.nativeEvent.contentOffset.y > 280 && tab === 'Menu';
    if (next === stickyRef.current) return;
    stickyRef.current = next;
    setStickyCats(next);
  };

  const onSectionLayout = (catId: string) => (e: LayoutChangeEvent) => {
    sectionY.current[catId] = menuOffsetY.current + e.nativeEvent.layout.y;
  };

  if (restaurant.isLoading) return <LoadingView label="Loading restaurant…" />;

  if (restaurant.isError || !restaurant.data) {
    return (
      <View style={styles.errorWrap}>
        <ErrorView
          message={restaurant.error instanceof Error ? restaurant.error.message : 'Restaurant not found'}
          onRetry={restaurant.refetch}
        />
      </View>
    );
  }

  const r = restaurant.data;
  const restaurantName = r.name || 'Restaurant';
  const meta = restaurantDetailMeta({
    restaurant: r,
    reviewStats: reviewStats.data,
    histogram: ratingsHistogram.data,
    timings: timings.data,
    timingsLoading: timings.isLoading,
    hygiene: hygiene.data,
  });
  const locationText = r.address || r.city || 'Near you';
  const distanceKm = resolveRestaurantDistanceKm(r, coords);
  const eta = restaurantDetailEtaLabel(r, distanceKm);
  const cuisineLine =
    (r.cuisines || []).slice(0, 3).join(' · ') || (r.menuCategories || []).slice(0, 2).join(' · ') || null;
  const infoDescription =
    r.description ||
    `${restaurantName} serves ${(cuisineLine ?? 'great food').toLowerCase()}. Order fresh favourites with live tracking.`;
  const watchingOpen = (alerts.data ?? []).some(
    (a) => a.restaurantId === id && !a.itemId && a.active !== false && String(a.type).includes('open')
  );

  const applyMenuFilter = (next: MenuFilterId) => {
    setMenuFilter(next);
    setTab('Menu');
    if (next === 'veg') setVegMode('pure_veg');
    else if (vegMode === 'pure_veg') setVegMode('all');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        {...PREMIUM_SCROLL}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        onScroll={onScroll}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom, ...(tab === 'Info' ? { flexGrow: 1 } : null) }}
      >
        <RestaurantHero
          cover={r.coverUrl || r.imageUrl || ''}
          logo={r.logoUrl || r.imageUrl}
          name={restaurantName}
          cuisineLine={cuisineLine}
          offerBadges={restaurantOfferBadges(r)}
          dutyLabel={meta.dutyLabel}
          ratingText={meta.ratingText}
          reviewsCount={meta.reviewsCount}
          distanceLabel={formatDistanceKm(distanceKm ?? undefined)}
          eta={eta}
          locationText={locationText}
          status={{
            loading: meta.openStatusLoading,
            closed: meta.kitchenClosed,
            open: meta.kitchenOpen,
            nextOpenLabel: meta.nextOpenLabel,
          }}
          onBack={() => navigateBack(router, '/home')}
          onShare={() => setShareOpen(true)}
        />

        <RestaurantMenuSearchBar
          menuFilter={menuFilter}
          onMenuFilter={applyMenuFilter}
          vegOnly={vegOnly}
          restaurantName={restaurantName}
          onOpenSearch={() => {
            setTab('Menu');
            openRestaurantMenuSearch(router, id, restaurantName);
          }}
        />

        <RestaurantDetailTabs active={tab} onChange={setTab} />

        <RestaurantDetailTabTransition tab={tab} style={tab === 'Info' ? { flexGrow: 1 } : undefined}>
          {tab === 'Menu' ? (
            <View onLayout={(e) => { menuOffsetY.current = e.nativeEvent.layout.y; }}>
              <RestaurantMenuSections
                rail={<RestaurantCategoryRail categories={categoryChips} activeId={activeCat} onSelect={jumpToCategory} />}
                loading={menu.isLoading}
                groups={grouped}
                filtered={menuFilter !== 'all'}
                fadeStyle={menuFilterFadeStyle}
                unavailable={new Set(unavailableIds ?? [])}
                highlightedItemId={highlightedItemId}
                onSectionLayout={onSectionLayout}
                onOpenItem={setSelectedItem}
                onClearFilter={() => applyMenuFilter('all')}
              />
            </View>
          ) : null}

          {tab === 'Offers' ? <RestaurantOffersPanel offers={offers.data ?? []} /> : null}

          {tab === 'Reviews' ? <RestaurantReviewsPanel restaurantId={id} /> : null}

          {tab === 'Info' ? (
            <RestaurantInfoPanel
              fillMinHeight={Math.max(420, windowHeight - 300)}
              restaurant={r}
              restaurantName={restaurantName}
              description={infoDescription}
              locationText={locationText}
              eta={eta ?? null}
              distanceKm={distanceKm ?? r.distance}
              kitchenClosed={meta.kitchenClosed}
              nextOpenLabel={meta.nextOpenLabel}
              openNow={meta.openNow}
              showHygieneScore={meta.showHygieneScore}
              infoHygieneScore={meta.hygieneScore}
              infoFssaiFull={meta.fssai}
              showInfoFssaiOrHygiene={meta.showFssaiOrHygiene}
              token={token}
              watchingOpen={watchingOpen}
              notifyPending={notifyOpen.subscribe.isPending || notifyOpen.unsubscribe.isPending}
              onToggleNotifyOpen={() => {
                if (watchingOpen) notifyOpen.unsubscribe.mutate();
                else notifyOpen.subscribe.mutate();
              }}
              timings={timings.data}
              holidays={holidays.data ?? []}
              specialHours={specialHours.data ?? []}
            />
          ) : null}
        </RestaurantDetailTabTransition>
      </ScrollView>

      {stickyCats ? (
        <View style={[styles.stickyCats, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
          <RestaurantCategoryRail categories={categoryChips} activeId={activeCat} onSelect={jumpToCategory} compact />
        </View>
      ) : null}

      {selectedItem ? (
        <MenuItemDetailSheet
          item={selectedItem}
          restaurantId={id}
          restaurantName={r.name}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}

      <CartFloatingBar />

      <RestaurantShareSheet
        visible={shareOpen}
        restaurant={id ? { id, slug: r.slug, name: restaurantName } : null}
        onClose={() => setShareOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stickyCats: {
    position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.98)',
    borderBottomWidth: 1, borderBottomColor: '#CBD5E1', zIndex: 20, shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
});
