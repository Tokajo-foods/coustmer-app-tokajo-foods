import { Pressable } from '@/components/common/Pressable';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, UtensilsCrossed, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { PREMIUM_LIST } from '@/lib/motion/premium';
import { EmptyView, ErrorView } from '@/components/common/StateViews';
import { RestaurantListCard } from '@/components/restaurant/RestaurantListCard';
import { restaurantBrowseStyles as styles } from '@/components/restaurant/restaurant-browse-styles';
import { CategoryExploreScreen } from '@/components/restaurant/CategoryExploreScreen';
import { openRestaurantMenu } from '@/lib/restaurant/open-restaurant';
import { authTheme } from '@/constants/auth-theme';
import {
  extractCityFromAddress,
  normalizeCityName,
} from '@/lib/location/format';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { useNearbyRestaurants, useRestaurants } from '@/lib/restaurant/hooks';
import { homeFiltersToNearbyParams } from '@/lib/restaurant/nearby-params';
import { useActiveZoneSurge } from '@/lib/delivery/use-active-zone-surge';
import { DEFAULT_HOME_FILTERS } from '@/lib/home/filters';
import type { Restaurant } from '@/lib/restaurant/types';
import type { SearchRestaurant } from '@/lib/search/types';
import { useDebouncedValue, useSearchRestaurants } from '@/lib/search/hooks';
import {
  useDeliveryCoords,
  useDeliveryLocationStore,
} from '@/store/delivery-location-store';

const NEARBY_LIST_LIMIT = 50;

function mapSearchHitToRestaurant(r: SearchRestaurant): Restaurant {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    imageUrl: r.imageUrl,
    coverUrl: r.coverUrl,
    rating: r.rating,
    reviewCount: r.reviewCount,
    cuisines: r.cuisines,
    deliveryTime: r.deliveryTime,
    priceForTwo: r.priceForTwo,
    costForTwo: r.costForTwo,
    distance: r.distance,
    isOpen: r.isOpen,
    isOnline: r.isOnline,
    isOpenNow: r.isOpenNow,
    kitchenStatus: r.kitchenStatus,
    pausedAt: r.pausedAt,
    pausedUntil: r.pausedUntil,
    availabilityLabel: r.availabilityLabel,
    nextOpenAt: r.nextOpenAt,
    closedReason: r.closedReason,
    address: r.address,
    city: r.city,
    offer: r.offer,
    isPureVeg: r.isPureVeg,
    lat: r.lat,
    lng: r.lng,
  };
}

export function RestaurantBrowseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    q?: string;
    cuisine?: string;
    view?: string;
  }>();

  if (
    params.view === 'dishes' &&
    params.cuisine &&
    params.cuisine !== 'all' &&
    params.cuisine !== 'popular'
  ) {
    return <CategoryExploreScreen />;
  }

  return <RestaurantBrowseAllScreen initialQuery={params.q} />;
}

type BrowseProps = { initialQuery?: string };

function RestaurantBrowseAllScreen({ initialQuery }: BrowseProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialQuery ?? '');
  const deliveryLocation = useDeliveryLocationStore((s) => s.location);
  const coords = useDeliveryCoords();
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { chipLabel: surgeChipLabel } = useActiveZoneSurge();

  const city = useMemo(() => {
    const raw =
      deliveryLocation?.city ||
      (deliveryLocation?.formattedAddress
        ? extractCityFromAddress(deliveryLocation.formattedAddress)
        : null);
    return normalizeCityName(raw);
  }, [deliveryLocation]);

  useEffect(() => {
    if (initialQuery) setSearch(initialQuery);
  }, [initialQuery]);

  const isTextSearch = debouncedSearch.length >= 2;
  const useNearby = !isTextSearch && Boolean(coords?.lat && coords?.lng);

  const searchQuery = useSearchRestaurants(
    {
      q: debouncedSearch,
      lat: coords?.lat,
      lng: coords?.lng,
      radius: coords ? CUSTOMER_DISCOVERY_RADIUS_KM * 1000 : undefined,
      sort: 'relevance',
      limit: 40,
    },
    { enabled: isTextSearch }
  );

  const nearbyQuery = useNearbyRestaurants(
    useNearby && coords
      ? homeFiltersToNearbyParams(coords, DEFAULT_HOME_FILTERS, {
          radius: CUSTOMER_DISCOVERY_RADIUS_KM,
          limit: NEARBY_LIST_LIMIT,
        })
      : null
  );

  const fallbackQuery = useRestaurants({
    search: undefined,
    city: city || undefined,
    sort: 'newest',
    lat: coords?.lat,
    lng: coords?.lng,
    limit: NEARBY_LIST_LIMIT,
    fetchAll: false,
  });

  const baseList = useMemo((): Restaurant[] => {
    if (isTextSearch) {
      return (searchQuery.data?.restaurants ?? []).map(mapSearchHitToRestaurant);
    }
    if (useNearby && coords) {
      return nearbyQuery.data?.restaurants ?? [];
    }
    return fallbackQuery.data?.restaurants ?? [];
  }, [
    isTextSearch,
    useNearby,
    coords,
    searchQuery.data?.restaurants,
    nearbyQuery.data?.restaurants,
    fallbackQuery.data?.restaurants,
  ]);

  const filteredList = useMemo(() => {
    if (isTextSearch) return baseList;
    const q = search.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisines?.some((c) => c.toLowerCase().includes(q)) ||
        r.city?.toLowerCase().includes(q)
    );
  }, [baseList, search, isTextSearch]);

  const activeQuery = isTextSearch
    ? searchQuery
    : useNearby && coords
      ? nearbyQuery
      : fallbackQuery;

  const subtitle = useMemo(() => {
    if (activeQuery.isLoading) return 'Loading restaurants…';
    if (isTextSearch && debouncedSearch) {
      const n = filteredList.length;
      return `${n} result${n === 1 ? '' : 's'} for “${debouncedSearch}”`;
    }
    if (useNearby && coords) {
      const n = filteredList.length;
      return `${n} restaurant${n === 1 ? '' : 's'} within ${CUSTOMER_DISCOVERY_RADIUS_KM} km`;
    }
    if (city) {
      const n = filteredList.length;
      return `${n} restaurant${n === 1 ? '' : 's'} in ${city}`;
    }
    return `${filteredList.length} restaurants near you`;
  }, [
    activeQuery.isLoading,
    isTextSearch,
    debouncedSearch,
    filteredList.length,
    useNearby,
    coords,
    city,
  ]);

  const openRestaurant = (id: string) => {
    openRestaurantMenu(router, id);
  };

  const listHeader = (
    <View style={styles.searchBar}>
      <Search color={authTheme.brand} size={18} />
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Search restaurants or cuisines"
        placeholderTextColor={authTheme.textDim}
        returnKeyType="search"
        autoCorrect={false}
      />
      {search ? (
        <Pressable onPress={() => setSearch('')} hitSlop={8}>
          <X color={authTheme.textDim} size={16} />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient
        colors={['#FFF8F6', authTheme.bg, authTheme.bg]}
        locations={[0, 0.22, 1]}
        style={styles.container}
      >
        <ScreenHeader title="All restaurants" subtitle={subtitle} />

        {activeQuery.isLoading ? (
          <View style={styles.flex}>
            {listHeader}
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={authTheme.brand} size="large" />
              <Text style={styles.loadingLabel}>Finding restaurants…</Text>
            </View>
          </View>
        ) : activeQuery.isError ? (
          <View style={styles.flex}>
            {listHeader}
            <ErrorView
              message={
                activeQuery.error instanceof Error
                  ? activeQuery.error.message
                  : 'Failed to load restaurants'
              }
              onRetry={() => activeQuery.refetch()}
            />
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.flex}>
            {listHeader}
            <EmptyView
              icon={<UtensilsCrossed color={authTheme.textDim} size={44} />}
              title={
                isTextSearch
                  ? 'No restaurants found'
                  : useNearby && coords
                    ? 'We’re not servicing this area yet'
                    : 'No restaurants yet'
              }
              subtitle={
                isTextSearch
                  ? 'Try a different name or cuisine.'
                  : useNearby && coords
                    ? `No restaurants within ${CUSTOMER_DISCOVERY_RADIUS_KM} km of your delivery location.`
                    : 'Restaurants will appear here once partners join the platform.'
              }
            />
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.id}
            {...PREMIUM_LIST}
            contentContainerStyle={styles.list}
            ListHeaderComponent={listHeader}
            refreshControl={
              <RefreshControl
                refreshing={activeQuery.isRefetching}
                onRefresh={() => activeQuery.refetch()}
                tintColor={authTheme.brand}
              />
            }
            renderItem={({ item }) => (
              <RestaurantListCard
                restaurant={item}
                surgeChipLabel={surgeChipLabel}
                onPress={() => openRestaurant(item.id)}
              />
            )}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
