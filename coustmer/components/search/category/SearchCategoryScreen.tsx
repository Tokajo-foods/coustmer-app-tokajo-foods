import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { circleCategoryFor } from '@/components/home/tokajo/circle-categories';
import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
import { CartFloatingBar } from '@/components/order/CartFloatingBar';
import { openRestaurantMenu } from '@/lib/restaurant/open-restaurant';
import { useSearchCategoryDishes, useSearchScope } from '@/lib/search/hooks';
import { openSearchDish } from '@/lib/search/open-search-dish';
import type { SearchCategorySource, SearchDish } from '@/lib/search/types';

import { SearchMessage } from '../SearchSections';
import { ResultSkeleton } from '../SearchResultRows';
import { applyCategoryFilters, restaurantsFromDishes, toggleCategoryFilter, type CategoryFilterId } from './category-filters';
import { CategoryDishRow } from './CategoryDishRow';
import { CategoryFilterBar } from './CategoryFilterBar';
import { CategoryHero } from './CategoryHero';
import { CategoryRestaurantRail } from './CategoryRestaurantRail';
import { CategoryTopBar } from './CategoryTopBar';

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

/** Every dish near the customer for a tapped cuisine or food category. */
export function SearchCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ slug?: string; name?: string; source?: string }>();
  const slug = one(params.slug);
  const name = one(params.name);
  const rawSource = one(params.source);
  const source: SearchCategorySource | undefined =
    rawSource === 'cuisine' || rawSource === 'food_category' || rawSource === 'menu_section' ? rawSource : undefined;

  const scope = useSearchScope();
  const query = useSearchCategoryDishes({ slug, name: name || undefined, source });
  const [filters, setFilters] = useState<CategoryFilterId[]>([]);
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const title = query.data?.category.name || name || slug.replace(/[-_]/g, ' ');
  const allDishes = useMemo(() => query.data?.dishes ?? [], [query.data?.dishes]);
  const dishes = useMemo(() => applyCategoryFilters(allDishes, filters), [allDishes, filters]);
  const restaurants = useMemo(() => restaurantsFromDishes(allDishes), [allDishes]);
  const art = useMemo(() => {
    const local = circleCategoryFor(slug, name)?.image;
    if (local) return local;
    const remote = query.data?.category.imageUrl;
    return remote ? { uri: remote } : undefined;
  }, [slug, name, query.data?.category.imageUrl]);

  const openDish = useCallback((dish: SearchDish) => openSearchDish(router, dish), [router]);
  const openRestaurant = useCallback(
    (id: string) => openRestaurantMenu(router, id, { params: { category: slug } }),
    [router, slug],
  );
  const goBack = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/home')), [router]);
  const toggle = useCallback((id: CategoryFilterId) => setFilters((f) => toggleCategoryFilter(f, id)), []);

  const loading = Boolean(scope) && query.isLoading;
  const hasData = Boolean(scope) && !loading && allDishes.length > 0;

  const header = (
    <>
      <CategoryHero
        title={title}
        art={art}
        dishCount={allDishes.length}
        restaurantCount={restaurants.length}
        loading={loading}
        topInset={insets.top}
      />
      {hasData ? (
        <>
          <CategoryRestaurantRail title={title} restaurants={restaurants} onOpen={openRestaurant} />
          <CategoryFilterBar active={filters} onToggle={toggle} />
        </>
      ) : null}
    </>
  );

  const empty = !scope ? (
    <SearchMessage kind="empty" title="Set your delivery location"
      body="We show dishes from restaurants that deliver to your address." />
  ) : loading ? (
    <ResultSkeleton rows={5} />
  ) : query.isError ? (
    <SearchMessage kind="error" title="Couldn't load dishes"
      body={query.error instanceof Error ? query.error.message : 'Please try again.'}
      onRetry={() => void query.refetch()} />
  ) : allDishes.length ? (
    <SearchMessage kind="empty" title="No dishes match these filters"
      body="Remove a filter to see more options." />
  ) : (
    <SearchMessage kind="empty" title={`No ${title} near you yet`}
      body="Restaurants that deliver to your address don't serve this yet. Try another category." />
  );

  return (
    <View style={styles.root}>
      <Animated.FlatList
        data={dishes}
        keyExtractor={(d) => `${d.restaurantId}-${d.id}`}
        renderItem={({ item }) => <CategoryDishRow dish={item} onPress={openDish} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: APP_BOTTOM_NAV_INSET + 96 }}
        initialNumToRender={8}
        windowSize={7}
      />
      <CategoryTopBar title={title} scrollY={scrollY} topInset={insets.top} onBack={goBack} />
      <CartFloatingBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
});
