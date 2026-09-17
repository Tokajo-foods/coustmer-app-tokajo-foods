import { useRouter } from 'expo-router';
import { Clock, Flame, MapPin, Sparkles, Trophy } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { FilteredHomeResults } from '@/components/home/FilteredHomeResults';
import { ErrorView } from '@/components/common/StateViews';
import { TokajoDishRail } from '@/components/home/tokajo/TokajoDishRail';
import { TokajoRestaurantRail } from '@/components/home/tokajo/TokajoRestaurantRail';
import { TokajoSectionHeader } from '@/components/home/tokajo/TokajoSectionHeader';
import { fonts } from '@/constants/typography';
import type { HomeFeed } from '@/lib/customer/types';
import type { HomeFilterState } from '@/lib/home/filters';
import type { HomeCategory, HomeRestaurantCard } from '@/lib/home/types';
import type { CuisineChip, Restaurant } from '@/lib/restaurant/types';

/** Map a home-feed restaurant card to the shape the Tokajo card reads. */
function toRestaurant(card: HomeRestaurantCard): Restaurant {
  return {
    id: card.id,
    name: card.name,
    imageUrl: card.image ?? undefined,
    coverUrl: card.image ?? undefined,
    logoUrl: card.logoUrl ?? undefined,
    rating: card.rating,
    reviewCount: card.reviewCount,
    deliveryTime: card.deliveryTime ?? undefined,
    cuisines: card.cuisines,
    isPureVeg: card.isPureVeg,
    offer: card.hasOffers ? 'Offers' : undefined,
  } as Restaurant;
}

type Props = {
  filtersActive: boolean;
  homeFilters: HomeFilterState;
  onFiltersChange: (next: HomeFilterState) => void;
  onClearFilters: () => void;
  baseRestaurants: Restaurant[];
  restaurants: Restaurant[];
  topRestaurants: Restaurant[];
  homeCategories: HomeCategory[];
  liveCuisines?: CuisineChip[];
  feedRails?: HomeFeed | null;
  homeLoading: boolean;
  userLoggedIn: boolean;
  favoriteIds: string[];
  surgeChipLabel?: string | null;
  onToggleFavorite: (id: string) => void;
  onPressRestaurant: (id: string) => void;
  feedError?: string | null;
  onRetryFeed?: () => void;
  listLoading: boolean;
};

/** TOKAJO home body: Trending dishes · Restaurants near you · Order again. */
export function TokajoFeedSections(props: Props) {
  const router = useRouter();
  const {
    filtersActive,
    homeFilters,
    onFiltersChange,
    onClearFilters,
    baseRestaurants,
    restaurants,
    topRestaurants,
    homeCategories,
    liveCuisines = [],
    feedRails,
    homeLoading,
    userLoggedIn,
    favoriteIds,
    surgeChipLabel,
    onToggleFavorite,
    onPressRestaurant,
    feedError,
    onRetryFeed,
    listLoading,
  } = props;

  if (filtersActive) {
    return (
      <FilteredHomeResults
        homeFilters={homeFilters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
        baseRestaurants={baseRestaurants}
        restaurants={restaurants}
        homeCategories={homeCategories}
        liveCuisines={liveCuisines}
        favoriteIds={favoriteIds}
        surgeChipLabel={surgeChipLabel}
        onToggleFavorite={onToggleFavorite}
        onPressRestaurant={onPressRestaurant}
      />
    );
  }

  const openDish = (restaurantId: string) => onPressRestaurant(restaurantId);
  const railsBusy = homeLoading && !feedRails;

  const trending =
    (feedRails?.trendingDishes?.length
      ? feedRails.trendingDishes
      : feedRails?.dishesToTry) ?? [];
  const suggested = feedRails?.suggestedItems ?? [];
  const orderAgain = feedRails?.orderAgain ?? [];
  const topRated = (feedRails?.topRated ?? []).map(toRestaurant);

  return (
    <View style={styles.wrap}>
      {trending.length > 0 || railsBusy ? (
        <View style={styles.section}>
          <TokajoSectionHeader
            Icon={Flame}
            title="Trending Near You"
            onSeeAll={() => router.push('/search')}
          />
          <TokajoDishRail
            dishes={trending}
            variant="trending"
            favoriteIds={favoriteIds}
            loading={railsBusy}
            onToggleFavorite={onToggleFavorite}
            onPressDish={openDish}
          />
        </View>
      ) : null}

      {suggested.length > 0 ? (
        <View style={[styles.section, styles.bandOrange]}>
          <TokajoSectionHeader Icon={Sparkles} title="Suggested for You" />
          <TokajoDishRail
            dishes={suggested}
            variant="suggested"
            favoriteIds={favoriteIds}
            loading={railsBusy}
            onToggleFavorite={onToggleFavorite}
            onPressDish={openDish}
          />
        </View>
      ) : null}

      {userLoggedIn && (orderAgain.length > 0 || railsBusy) ? (
        <View style={styles.section}>
          <TokajoSectionHeader
            Icon={Clock}
            title="Order Again"
            onSeeAll={() => router.push('/orders')}
          />
          <TokajoDishRail
            dishes={orderAgain}
            variant="orderAgain"
            favoriteIds={favoriteIds}
            loading={railsBusy}
            onToggleFavorite={onToggleFavorite}
            onPressDish={openDish}
          />
        </View>
      ) : null}

      {topRated.length > 0 ? (
        <View style={[styles.section, styles.bandOrange]}>
          <TokajoSectionHeader
            Icon={Trophy}
            title="Top Rated Near You"
            onSeeAll={() => router.push('/restaurants')}
          />
          <TokajoRestaurantRail
            restaurants={topRated}
            favoriteIds={favoriteIds}
            onToggleFavorite={onToggleFavorite}
            onPressRestaurant={onPressRestaurant}
          />
        </View>
      ) : null}

      {feedError ? (
        <View style={styles.errorWrap}>
          <ErrorView message={feedError} onRetry={onRetryFeed} />
        </View>
      ) : null}

      {!railsBusy &&
      !listLoading &&
      trending.length === 0 &&
      topRestaurants.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No restaurants near you yet. Pull to refresh or change your delivery
            address.
          </Text>
        </View>
      ) : null}

      {topRestaurants.length > 0 || listLoading ? (
        <View style={styles.restaurantsHeader}>
          <TokajoSectionHeader Icon={MapPin} title="Restaurants Near You" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
  },
  section: {
    marginBottom: 22,
  },
  bandOrange: {
    marginHorizontal: 0,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#FFF3E8',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FFE3CB',
  },
  restaurantsHeader: {
    marginTop: 4,
    marginBottom: 6,
  },
  errorWrap: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 4,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  emptyText: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: '#EA580C',
    textAlign: 'center',
    lineHeight: 19,
  },
});
