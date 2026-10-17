import { Search, SearchX, WifiOff } from 'lucide-react-native';
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { PREMIUM_LIST } from '@/lib/motion/premium';
import type { SearchCategory, SearchDish, SearchRestaurant, SearchSuggestion } from '@/lib/search/types';

import { CategoryChips } from './CategoryChips';
import { searchColors, searchStyles as s } from './search-styles';
import { DishRow, RestaurantRow, ResultSkeleton } from './SearchResultRows';
import { SuggestionRow } from './SuggestionRow';

const { muted: MUTED, orange: ORANGE } = searchColors;

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

export function SuggestionList({ query, items, correctedQuery, onPick, onFill, onSearchAll }: {
  query: string;
  items: SearchSuggestion[];
  correctedQuery?: string;
  onPick: (item: SearchSuggestion) => void;
  onFill: (text: string) => void;
  onSearchAll: () => void;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      {...PREMIUM_LIST}
      keyboardShouldPersistTaps="handled"
      style={s.list}
      contentContainerStyle={s.resultsList}
      ListHeaderComponent={
        <>
          <Pressable style={s.searchAllRow} onPress={onSearchAll} android_ripple={{ color: '#F1F5F9' }}>
            <View style={s.searchAllIcon}>
              <Search color={ORANGE} size={15} strokeWidth={2.6} />
            </View>
            <Text style={s.searchAllText} numberOfLines={1}>
              See all results for <Text style={s.searchAllQuery}>“{query.trim()}”</Text>
            </Text>
          </Pressable>
          <Corrected query={correctedQuery} />
        </>
      }
      renderItem={({ item }) => <SuggestionRow item={item} query={correctedQuery || query} onPress={onPick} onFill={onFill} />}
    />
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
    if (restaurants.length) {
      out.push({ type: 'header', label: `Restaurants (${restaurants.length})` });
      restaurants.forEach((r) => out.push({ type: 'restaurant', data: r }));
    }
    if (dishes.length) {
      out.push({ type: 'header', label: `Dishes (${dishes.length})` });
      dishes.forEach((d) => out.push({ type: 'dish', data: d }));
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
