import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingView } from '@/components/common/StateViews';
import { SaveAddressLabelModal } from '@/components/address/SaveAddressLabelModal';
import { TokajoFeedSections } from '@/components/home/tokajo/TokajoFeedSections';
import { TokajoHomeChrome } from '@/components/home/tokajo/TokajoHomeChrome';
import { TokajoRestaurantListCard } from '@/components/home/tokajo/TokajoRestaurantListCard';
import type { TokajoCategory } from '@/components/home/tokajo/TokajoCategoryStrip';
import { VegModeModal } from '@/components/home/VegModeModal';
import { DeliveryLocationPicker } from '@/components/location/DeliveryLocationPicker';
import { InitialLocationSheet } from '@/components/location/InitialLocationSheet';
import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
import { CartFloatingBar } from '@/components/order/CartFloatingBar';
import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';
import { HOME_FEED_LIST } from '@/lib/motion/premium';
import { setFeedScrolling } from '@/lib/motion/scroll-activity';
import { addressApi } from '@/lib/address/api';
import { formatAddressLabel } from '@/lib/address/types';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import {
  useAppConfig,
  useCustomerProfile,
  useDeals,
  useHomeFeed,
  useOffersFeed,
} from '@/lib/customer/hooks';
import { useFavoriteToggle } from '@/lib/customer/useFavoriteToggle';
import {
  applyHomeFilters,
  countActiveHomeFilters,
  DEFAULT_HOME_FILTERS,
  type HomeFilterState,
} from '@/lib/home/filters';
import { useHomeDishRails } from '@/lib/home/use-home-dish-rails';
import {
  deliveryHeaderSubtitle,
  deliveryHeaderTitle,
  formatFullDeliveryAddress,
  extractCityFromAddress,
  isCoordinateFallbackAddress,
  normalizeCityName,
  restaurantMatchesCity,
} from '@/lib/location/format';
import { parseDeliveryAddress } from '@/lib/order/parse-address';
import {
  useHomeCategories,
  useInfiniteRestaurants,
  useNearbyMindCategories,
  useNearbyRestaurants,
  useRestaurantCuisines,
} from '@/lib/restaurant/hooks';
import { homeFiltersToNearbyParams } from '@/lib/restaurant/nearby-params';
import { useAuthStore } from '@/store/auth-store';
import {
  useDeliveryCoords,
  useDeliveryLocationStore,
} from '@/store/delivery-location-store';
import {
  type VegMode,
  useVegPreferenceStore,
} from '@/store/veg-preference-store';
import type { Restaurant } from '@/lib/restaurant/types';

function dedupeRestaurants(rows: Restaurant[]): Restaurant[] {
  const seen = new Set<string>();
  const out: Restaurant[] = [];
  for (const row of rows) {
    if (!row.id || seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

const ORANGE = '#F97316';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [vegModalOpen, setVegModalOpen] = useState(false);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);
  const [homeFilters, setHomeFilters] =
    useState<HomeFilterState>(DEFAULT_HOME_FILTERS);
  const [savePrompt, setSavePrompt] = useState<{
    label: string;
    formattedAddress: string;
    city?: string;
    lat: number;
    lng: number;
    source: 'gps' | 'search';
  } | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const vegMode = useVegPreferenceStore((s) => s.mode);
  const setVegMode = useVegPreferenceStore((s) => s.setMode);

  const deliveryLocation = useDeliveryLocationStore((s) => s.location);
  const locationGate = useDeliveryLocationStore((s) => s.locationGate);
  const isDetectingLocation = useDeliveryLocationStore((s) => s.isDetecting);
  const pinReady = useDeliveryLocationStore((s) => s.pinReady);
  const setDeliveryLocation = useDeliveryLocationStore((s) => s.setLocation);
  const coords = useDeliveryCoords();
  const hasPin = Boolean(deliveryLocation?.lat && deliveryLocation?.lng);
  const expectSavePrompt = useRef(false);

  const city = useMemo(() => {
    const raw =
      deliveryLocation?.city ||
      (deliveryLocation?.formattedAddress
        ? extractCityFromAddress(deliveryLocation.formattedAddress)
        : null) ||
      null;
    return normalizeCityName(raw);
  }, [deliveryLocation]);

  const deliveryTitle = useMemo(() => {
    if (!deliveryLocation) return 'Set delivery address';
    if (
      isCoordinateFallbackAddress(deliveryLocation.formattedAddress) ||
      isCoordinateFallbackAddress(deliveryLocation.label)
    ) {
      return isDetectingLocation ? 'Detecting your location…' : 'Current location';
    }
    if (deliveryLocation.source === 'gps') {
      return (
        formatFullDeliveryAddress(deliveryLocation.formattedAddress) ||
        'Current location'
      );
    }
    return deliveryHeaderTitle(
      deliveryLocation.label,
      deliveryLocation.formattedAddress
    );
  }, [deliveryLocation, isDetectingLocation]);

  const deliverySubtitle = useMemo(() => {
    if (!deliveryLocation) return '';
    if (
      isCoordinateFallbackAddress(deliveryLocation.formattedAddress) ||
      isCoordinateFallbackAddress(deliveryLocation.label)
    ) {
      return '';
    }
    if (deliveryLocation.source === 'gps') return '';
    return deliveryHeaderSubtitle(
      deliveryTitle,
      deliveryLocation.formattedAddress
    );
  }, [deliveryLocation, deliveryTitle]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _config = useAppConfig(); // fetch config on home-mount (splash already rendered)
  const home = useHomeFeed();
  const deals = useDeals();
  const offers = useOffersFeed();
  const profile = useCustomerProfile();
  const { favoriteIds, toggleFavorite } = useFavoriteToggle();

  const feed = useInfiniteRestaurants(
    {
      city: city || undefined,
      sort: 'newest',
      limit: 12,
      lat: coords?.lat,
      lng: coords?.lng,
      hygiene: homeFilters.hygieneRatedOnly || undefined,
      offers: homeFilters.offersOnly || undefined,
      veg: homeFilters.pureVeg || undefined,
    },
    { enabled: Boolean(city) && !hasPin }
  );

  const nearbyParams = useMemo(
    () =>
      coords?.lat && coords?.lng
        ? homeFiltersToNearbyParams(
            { lat: coords.lat, lng: coords.lng },
            homeFilters,
            { radius: CUSTOMER_DISCOVERY_RADIUS_KM, limit: 40 }
          )
        : null,
    [coords?.lat, coords?.lng, homeFilters]
  );
  const nearby = useNearbyRestaurants(nearbyParams);
  const liveCuisines = useRestaurantCuisines();
  const mindCategories = useNearbyMindCategories(coords, {
    radiusKm: CUSTOMER_DISCOVERY_RADIUS_KM,
    restaurantLimit: 40,
  });

  const baseRestaurants = useMemo(() => {
    const nearbyRows = nearby.data?.restaurants ?? [];

    // A delivery pin is authoritative. Never fall back to a city-wide list
    // while it is set — that is what showed Greater Noida for another town.
    if (hasPin) {
      return dedupeRestaurants(nearbyRows);
    }

    // ── Fallback: city-string feed (no GPS / nearby still loading) ────────────
    const rows = feed.data?.pages.flatMap((p) => p.restaurants) ?? [];

    if (!city) return [];

    // Filter strictly by city. Never fall back to "show all" — that's what
    // caused Greater Noida restaurants to appear when a different city is chosen.
    const matched = rows.filter((r) => restaurantMatchesCity(r, city));
    return matched;
  }, [feed.data?.pages, nearby.data?.restaurants, hasPin, city]);

  const { feedRails, homeLoading: dishRailsLoading } = useHomeDishRails({
    feed: home.data,
    feedLoading: home.isLoading,
    restaurants: baseRestaurants,
    loggedIn: Boolean(user),
  });

  const restaurants = useMemo(
    () =>
      applyHomeFilters(baseRestaurants, homeFilters, {
        skipServerSide: Boolean(
          nearbyParams && (nearby.data?.restaurants?.length ?? 0) > 0
        ),
      }),
    [baseRestaurants, homeFilters, nearbyParams, nearby.data?.restaurants]
  );

  const homeCategories = useHomeCategories(baseRestaurants);

  const mindCategoriesForHome = useMemo(() => {
    // API already returns unique menu categories from nearby restaurants
    // (not cuisine tags). Trust the server list as-is.
    return mindCategories.data?.categories ?? [];
  }, [mindCategories.data?.categories]);

  /** Category rail chips — live API menu categories (no hardcoded list). */
  const tokajoCategories = useMemo<TokajoCategory[]>(() => {
    const fromMind = mindCategoriesForHome.map((c) => ({
      id: c.id || c.slug || c.name,
      label: c.name,
      slug: c.slug || c.name,
      imageUrl: c.imageUrl,
    }));
    if (fromMind.length > 0) return fromMind;
    return (homeCategories.data ?? []).map((c) => ({
      id: c.id || c.slug || c.label,
      label: c.label,
      slug: c.slug || c.label,
      imageUrl: c.imageUrl,
    }));
  }, [mindCategoriesForHome, homeCategories.data]);

  /** Top rail: highest rated first (different order than feed / deals) */
  const topRestaurants = useMemo(() => {
    return [...restaurants].sort((a, b) => {
      const ar = typeof a.rating === 'number' ? a.rating : 0;
      const br = typeof b.rating === 'number' ? b.rating : 0;
      if (br !== ar) return br - ar;
      const ac = a.reviewCount ?? 0;
      const bc = b.reviewCount ?? 0;
      if (bc !== ac) return bc - ac;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [restaurants]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const openRestaurant = useCallback(
    (id: string) => {
      router.push({
        pathname: '/restaurants/[restaurantId]',
        params: { restaurantId: id },
      });
    },
    [router]
  );

  const onToggleFavorite = useCallback(
    (id: string) => {
      const r = restaurants.find((x) => x.id === id);
      toggleFavorite(id, r ? { restaurant: r } : undefined);
    },
    [restaurants, toggleFavorite]
  );

  const onEndReached = useCallback(() => {
    if (nearbyParams) return;
    if (feed.hasNextPage && !feed.isFetchingNextPage) {
      feed.fetchNextPage();
    }
  }, [nearbyParams, feed.hasNextPage, feed.isFetchingNextPage, feed.fetchNextPage]);

  const renderRestaurantItem = useCallback(
    ({ item, index }: { item: Restaurant; index: number }) => (
      <TokajoRestaurantListCard
        restaurant={item}
        divided={index > 0}
        isFavorite={favoriteIdSet.has(item.id)}
        onToggleFavorite={onToggleFavorite}
        onPress={openRestaurant}
      />
    ),
    [favoriteIdSet, onToggleFavorite, openRestaurant]
  );

  const listContentStyle = useMemo(
    () => ({
      paddingBottom: insets.bottom + 28 + APP_BOTTOM_NAV_INSET,
      flexGrow: 1 as const,
    }),
    [insets.bottom]
  );

  const refreshing =
    feed.isRefetching ||
    nearby.isRefetching ||
    home.isRefetching ||
    deals.isRefetching ||
    offers.isRefetching ||
    liveCuisines.isRefetching ||
    mindCategories.isRefetching;

  const onRefresh = () => {
    feed.refetch();
    nearby.refetch();
    home.refetch();
    deals.refetch();
    offers.refetch();
    profile.refetch();
    liveCuisines.refetch();
    mindCategories.refetch();
  };

  const onVegApply = useCallback((mode: VegMode) => {
    setVegMode(mode);
    setHomeFilters((prev) => ({
      ...prev,
      pureVeg: mode === 'pure_veg',
    }));
  }, [setVegMode]);

  const onFiltersChange = useCallback((next: HomeFilterState) => {
    setHomeFilters(next);
    if (next.pureVeg && vegMode !== 'pure_veg') {
      setVegMode('pure_veg');
    } else if (!next.pureVeg && vegMode === 'pure_veg') {
      setVegMode('all');
    }
  }, [vegMode, setVegMode]);

  const onClearFilters = useCallback(() => {
    setHomeFilters(DEFAULT_HOME_FILTERS);
    if (vegMode === 'pure_veg') setVegMode('all');
  }, [vegMode, setVegMode]);

  const onOpenLocationPicker = useCallback(() => setPickerOpen(true), []);

  const onRetryFeed = useCallback(() => {
    void feed.refetch();
  }, [feed.refetch]);

  const feedErrorMessage = useMemo(() => {
    if (!feed.isError) return null;
    return feed.error instanceof Error
      ? feed.error.message
      : 'Could not load restaurants';
  }, [feed.isError, feed.error]);

  const listLoading = useMemo(() => {
    if (hasPin && !pinReady) return true;
    if (nearbyParams) return nearby.isLoading && topRestaurants.length === 0;
    return feed.isLoading && topRestaurants.length === 0;
  }, [
    hasPin,
    pinReady,
    nearbyParams,
    nearby.isLoading,
    feed.isLoading,
    topRestaurants.length,
  ]);

  const onConfirmLocation = (result: {
    lat: number;
    lng: number;
    formattedAddress: string;
    label: string;
    source: 'gps' | 'search' | 'saved';
    savedAddressId?: string;
  }) => {
    setPickerOpen(false);
    setHasPromptedLocation(true);
    expectSavePrompt.current = result.source !== 'saved' && Boolean(user);
    const cityName = normalizeCityName(
      extractCityFromAddress(result.formattedAddress)
    );
    setDeliveryLocation({
      label: result.label,
      formattedAddress: result.formattedAddress,
      city: cityName,
      lat: result.lat,
      lng: result.lng,
      source: result.source,
      savedAddressId:
        result.source === 'saved' ? result.savedAddressId : undefined,
      pinTrusted: result.source !== 'saved',
      updatedAt: Date.now(),
    });
  };

  useEffect(() => {
    if (!expectSavePrompt.current || !user || !deliveryLocation?.pinTrusted) return;
    if (deliveryLocation.source === 'saved') return;
    expectSavePrompt.current = false;
    setSavePrompt({
      label: deliveryLocation.label,
      formattedAddress: deliveryLocation.formattedAddress,
      city: deliveryLocation.city,
      lat: deliveryLocation.lat,
      lng: deliveryLocation.lng,
      source: deliveryLocation.source === 'gps' ? 'gps' : 'search',
    });
  }, [deliveryLocation, user]);

  const closeSavePrompt = () => {
    if (savingAddress) return;
    setSavePrompt(null);
  };

  const onSaveAddressWithLabel = (payload: {
    label: 'home' | 'work' | 'other';
    displayLabel: string;
  }) => {
    if (!savePrompt || savingAddress) return;
    const applied = savePrompt;
    const parsed = parseDeliveryAddress({
      formattedAddress: applied.formattedAddress,
      label: payload.displayLabel,
      city: applied.city,
      lat: applied.lat,
      lng: applied.lng,
    });

    setSavingAddress(true);
    void addressApi
      .create({
        label: payload.label,
        formattedAddress: applied.formattedAddress,
        street: parsed.street,
        area: parsed.area,
        city: parsed.city,
        state: parsed.state,
        pincode: parsed.pincode,
        lat: applied.lat,
        lng: applied.lng,
        setAsDefault: true,
      })
      .then((saved) => {
        setDeliveryLocation({
          label:
            payload.displayLabel ||
            formatAddressLabel(saved.label) ||
            'Home',
          formattedAddress:
            saved.formattedAddress || applied.formattedAddress,
          city: normalizeCityName(
            saved.city ||
            extractCityFromAddress(
              saved.formattedAddress || applied.formattedAddress
            )
          ),
          lat: saved.lat || applied.lat,
          lng: saved.lng || applied.lng,
          source: 'saved',
          savedAddressId: saved.id,
          updatedAt: Date.now(),
        });
        setSavePrompt(null);
      })
      .catch((e) => {
        Alert.alert(
          'Could not save',
          e instanceof Error ? e.message : 'Try again from Profile'
        );
      })
      .finally(() => {
        setSavingAddress(false);
      });
  };

  const locationPicker = (
    <DeliveryLocationPicker
      visible={pickerOpen}
      initial={
        deliveryLocation
          ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng }
          : null
      }
      autoDetectOnOpen
      onClose={() => setPickerOpen(false)}
      onConfirm={onConfirmLocation}
    />
  );

  const showInitialSheet =
    !deliveryLocation &&
    !hasPromptedLocation &&
    !isDetectingLocation &&
    !pickerOpen &&
    locationGate === 'idle';

  const initialSheet = (
    <InitialLocationSheet
      visible={showInitialSheet}
      onManual={() => setPickerOpen(true)}
      onClose={() => setHasPromptedLocation(true)}
    />
  );

  const saveLabelModal = (
    <SaveAddressLabelModal
      visible={Boolean(savePrompt)}
      addressPreview={savePrompt?.formattedAddress}
      saving={savingAddress}
      onClose={closeSavePrompt}
      onSave={onSaveAddressWithLabel}
    />
  );

  const chromeBanners = useMemo(() => {
    const fromOffers = Array.isArray(offers.data?.banners)
      ? offers.data.banners
      : [];
    const fromFeed = Array.isArray(home.data?.banners) ? home.data.banners : [];
    return fromOffers.length > 0 ? fromOffers : fromFeed;
  }, [offers.data?.banners, home.data?.banners]);

  const filtersActive = countActiveHomeFilters(homeFilters) > 0;

  /**
   * Memoize the header so FlatList does not remount chrome + rails on every
   * parent re-render (that remount is the main home scroll jitter source).
   */
  const listHeader = useMemo(
    () => (
      <View>
        <TokajoHomeChrome
          topInset={insets.top}
          deliveryTitle={deliveryTitle}
          deliverySubtitle={deliverySubtitle}
          isDetectingLocation={isDetectingLocation}
          onLocationPress={onOpenLocationPicker}
          banners={chromeBanners}
          filters={homeFilters}
          onFiltersChange={onFiltersChange}
          categories={tokajoCategories}
          categoriesLoading={mindCategories.isLoading}
          restaurants={baseRestaurants}
        />

        <TokajoFeedSections
          filtersActive={filtersActive}
          onClearFilters={onClearFilters}
          restaurants={restaurants}
          topRestaurants={topRestaurants}
          feedRails={feedRails}
          homeLoading={dishRailsLoading}
          userLoggedIn={Boolean(user)}
          favoriteIds={favoriteIds}
          onToggleFavorite={onToggleFavorite}
          onPressRestaurant={openRestaurant}
          feedError={feedErrorMessage}
          onRetryFeed={onRetryFeed}
          listLoading={listLoading}
        />
      </View>
    ),
    [
      insets.top,
      deliveryTitle,
      deliverySubtitle,
      isDetectingLocation,
      onOpenLocationPicker,
      chromeBanners,
      homeFilters,
      onFiltersChange,
      tokajoCategories,
      mindCategories.isLoading,
      baseRestaurants,
      filtersActive,
      onClearFilters,
      restaurants,
      topRestaurants,
      feedRails,
      dishRailsLoading,
      user,
      favoriteIds,
      onToggleFavorite,
      openRestaurant,
      feedErrorMessage,
      onRetryFeed,
      listLoading,
    ]
  );

  const chrome = (
    <TokajoHomeChrome
      topInset={insets.top}
      deliveryTitle={deliveryTitle}
      deliverySubtitle={deliverySubtitle}
      isDetectingLocation={isDetectingLocation}
      onLocationPress={onOpenLocationPicker}
      banners={chromeBanners}
      filters={homeFilters}
      onFiltersChange={onFiltersChange}
      categories={tokajoCategories}
      categoriesLoading={mindCategories.isLoading}
      restaurants={baseRestaurants}
    />
  );

  const discoveryLoading =
    restaurants.length === 0 &&
    (nearbyParams
      ? nearby.isLoading || nearby.isFetching || home.isLoading
      : Boolean(city) && feed.isLoading);

  if (discoveryLoading) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        {chrome}
        <LoadingView label="Finding restaurants near you…" />
        {locationPicker}
        {initialSheet}
        {saveLabelModal}
        <VegModeModal
          visible={vegModalOpen}
          onClose={() => setVegModalOpen(false)}
          onApply={onVegApply}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <FlatList
        data={filtersActive ? [] : restaurants}
        keyExtractor={(item) => item.id}
        {...HOME_FEED_LIST}
        onScrollBeginDrag={() => setFeedScrolling(true)}
        onMomentumScrollBegin={() => setFeedScrolling(true)}
        onScrollEndDrag={(e) => {
          const vy = e.nativeEvent.velocity?.y ?? 0;
          if (Math.abs(vy) < 0.08) setFeedScrolling(false);
        }}
        onMomentumScrollEnd={() => setFeedScrolling(false)}
        onEndReached={onEndReached}
        contentContainerStyle={listContentStyle}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !filtersActive &&
          restaurants.length === 0 &&
          (nearbyParams
            ? !nearby.isLoading && !nearby.isFetching
            : !feed.isLoading && !!city) ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {nearbyParams
                  ? 'We’re not servicing this area yet'
                  : `No restaurants in ${city} yet`}
              </Text>
              <Text style={styles.emptyText}>
                {nearbyParams
                  ? `No restaurants within ${CUSTOMER_DISCOVERY_RADIUS_KM} km of your delivery location. Try a different address.`
                  : 'Partners in your city will appear here once they register. Pull to refresh.'}
              </Text>
              {nearbyParams ? (
                <Text
                  style={styles.emptyCta}
                  onPress={() => setPickerOpen(true)}
                >
                  Change delivery address
                </Text>
              ) : null}
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={authTheme.brand}
            progressViewOffset={insets.top}
          />
        }
        renderItem={renderRestaurantItem}
        ListFooterComponent={
          !nearbyParams && feed.isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={authTheme.brand} />
            </View>
          ) : null
        }
      />

      {locationPicker}
      {initialSheet}
      {saveLabelModal}
      <VegModeModal
        visible={vegModalOpen}
        onClose={() => setVegModalOpen(false)}
        onApply={onVegApply}
      />

      <CartFloatingBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyCard: {
    marginTop: 8,
    marginHorizontal: 16,
    padding: 28,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: authTheme.text,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 6,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: authTheme.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyCta: {
    marginTop: 14,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: ORANGE,
    textAlign: 'center',
  },
});
