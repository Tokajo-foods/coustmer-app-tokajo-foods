import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
import { CartFloatingBar } from '@/components/order/CartFloatingBar';
import { fonts } from '@/constants/typography';
import { PREMIUM_LIST } from '@/lib/motion/premium';
import { openRestaurantMenu } from '@/lib/restaurant/open-restaurant';
import { useSearchCategoryDishes } from '@/lib/search/hooks';
import type { SearchCategorySource, SearchDish } from '@/lib/search/types';

import { searchColors } from '../search-styles';
import { SearchMessage } from '../SearchSections';
import { ResultSkeleton } from '../SearchResultRows';
import { CategoryDishRow } from './CategoryDishRow';

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

/** Every dish near the customer for a tapped cuisine or food category. */
export function SearchCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string; name?: string; source?: string }>();
  const slug = one(params.slug);
  const name = one(params.name);
  const rawSource = one(params.source);
  const source: SearchCategorySource | undefined =
    rawSource === 'cuisine' || rawSource === 'food_category' ? rawSource : undefined;

  const query = useSearchCategoryDishes({ slug, name: name || undefined, source });
  const title = query.data?.category.name || name || slug.replace(/-/g, ' ');
  const dishes = query.data?.dishes ?? [];
  const restaurants = query.data?.restaurantCount ?? 0;

  const openDish = useCallback(
    (dish: SearchDish) => openRestaurantMenu(router, dish.restaurantId, { params: { itemId: dish.id } }),
    [router],
  );
  const goBack = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/home')), [router]);

  const subtitle = query.isLoading
    ? 'Finding dishes near you…'
    : dishes.length
      ? `${dishes.length} dish${dishes.length === 1 ? '' : 'es'} from ${restaurants} restaurant${restaurants === 1 ? '' : 's'} near you`
      : 'Near you';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SmoothPressable onPress={goBack} style={styles.back} pressScale={0.9} accessibilityLabel="Go back">
          <ArrowLeft color={searchColors.ink} size={22} strokeWidth={2} />
        </SmoothPressable>
        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.hairline} />

      {query.isLoading ? (
        <ResultSkeleton rows={6} />
      ) : query.isError && !dishes.length ? (
        <SearchMessage kind="error" title="Couldn't load dishes"
          body={query.error instanceof Error ? query.error.message : 'Please try again.'}
          onRetry={() => void query.refetch()} />
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(d) => `${d.restaurantId}-${d.id}`}
          {...PREMIUM_LIST}
          contentContainerStyle={{ paddingBottom: APP_BOTTOM_NAV_INSET + 96 }}
          renderItem={({ item }) => <CategoryDishRow dish={item} onPress={openDish} />}
          ListEmptyComponent={
            <SearchMessage kind="empty" title={`No ${title} dishes near you`}
              body="Restaurants that deliver to your address don't serve this yet. Try another cuisine." />
          }
        />
      )}
      <CartFloatingBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 6, paddingRight: 16, paddingVertical: 8 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1, gap: 1 },
  title: { fontFamily: fonts.displayBold, fontSize: 18, color: searchColors.ink, textTransform: 'capitalize' },
  subtitle: { fontFamily: fonts.ui, fontSize: 12.5, color: searchColors.muted },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: '#E4E4E7' },
});
