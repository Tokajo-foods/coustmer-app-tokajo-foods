import { SearchX, WifiOff } from 'lucide-react-native';
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { PREMIUM_LIST } from '@/lib/motion/premium';
import type { SearchCategory, SearchDish, SearchRestaurant } from '@/lib/search/types';

import { CategoryChips } from './CategoryChips';
import { searchColors, searchStyles as s } from './search-styles';
import { DishRow, RestaurantRow, ResultSkeleton } from './SearchResultRows';

const { muted: MUTED } = searchColors;

export function SearchMessage({ kind, title, body, onRetry }: {
  kind: 'empty' | 'error';
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  const Icon = kind === 'error' ? WifiOff : SearchX;
  return (
    <View style={s.emptyWrap}>
      <Icon color={MUTED} size={38} strokeWidth={1.5} />
      <Text style={s.emptyText}>{title}</Text>
      <Text style={[s.emptySubtext, { textAlign: 'center', paddingHorizontal: 32 }]}>{body}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={s.retryBtn} accessibilityRole="button">
          <Text style={s.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Corrected({ query }: { query?: string }) {
  if (!query) return null;
  return (
    <Text style={s.correctedText}>
      Showing results for <Text style={s.searchAllQuery}>{query}</Text>
    </Text>
  );
}

type ResultItem =
  | { type: 'header'; label: string }
  | { type: 'restaurant'; data: SearchRestaurant }
  | { type: 'dish'; data: SearchDish };

export function SearchResults({ query, loading, error, onRetry, correctedQuery, categories, restaurants, dishes,
  onCategory, onRestaurant, onDish }: {
  query: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  correctedQuery?: string;
  categories: SearchCategory[];
  restaurants: SearchRestaurant[];
  dishes: SearchDish[];
  onCategory: (c: SearchCategory) => void;
  onRestaurant: (r: SearchRestaurant) => void;
  onDish: (d: SearchDish) => void;
}) {
  const data = useMemo<ResultItem[]>(() => {
    const out: ResultItem[] = [];
    if (dishes.length) {
      out.push({ type: 'header', label: `Dishes (${dishes.length})` });
      dishes.forEach((d) => out.push({ type: 'dish', data: d }));
    }
    if (restaurants.length) {
      out.push({ type: 'header', label: `Restaurants (${restaurants.length})` });
      restaurants.forEach((r) => out.push({ type: 'restaurant', data: r }));
    }
    return out;
  }, [restaurants, dishes]);

  if (loading && data.length === 0 && !categories.length) return <ResultSkeleton />;
  if (error && data.length === 0) {
    return <SearchMessage kind="error" title="Couldn't search right now" body={error} onRetry={onRetry} />;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item, i) => (item.type === 'header' ? `h-${item.label}` : `${item.type}-${item.data.id}-${i}`)}
      {...PREMIUM_LIST}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.resultsList}
      ListHeaderComponent={
        <>
          <Corrected query={correctedQuery} />
          <CategoryChips items={categories} onPick={onCategory} />
        </>
      }
      ListEmptyComponent={
        categories.length ? null : (
          <SearchMessage kind="empty" title={`No results for “${query}”`}
            body="Nothing near you matches. Try another dish, cuisine or restaurant name." />
        )
      }
      renderItem={({ item }) => {
        if (item.type === 'header') return <Text style={s.resultSectionHeader}>{item.label}</Text>;
        if (item.type === 'restaurant') return <RestaurantRow restaurant={item.data} onPress={() => onRestaurant(item.data)} />;
        return <DishRow dish={item.data} onPress={() => onDish(item.data)} />;
      }}
    />
  );
}
