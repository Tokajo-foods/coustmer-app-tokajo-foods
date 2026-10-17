import { Clock, Search, TrendingUp, X } from 'lucide-react-native';
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { PREMIUM_LIST } from '@/lib/motion/premium';
import type { SearchDish, SearchRestaurant, SearchSuggestion } from '@/lib/search/types';

import { searchColors, searchStyles as s } from './search-styles';
import { DishRow, RestaurantRow, ResultSkeleton, SuggestionRow } from './SearchResultRows';

const { muted: MUTED, orange: ORANGE } = searchColors;

export function RecentSearches({
  terms,
  onPick,
  onRemove,
  onClear,
}: {
  terms: string[];
  onPick: (term: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Recent searches</Text>
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={s.clearBtn}>Clear all</Text>
        </Pressable>
      </View>
      {terms.map((term) => (
        <Pressable key={term} style={s.recentRow} onPress={() => onPick(term)}>
          <Clock color={MUTED} size={14} strokeWidth={2} />
          <Text style={s.recentText}>{term}</Text>
          <Pressable onPress={() => onRemove(term)} hitSlop={8} style={s.recentRemove} accessibilityLabel={`Remove ${term}`}>
            <X color={MUTED} size={12} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}

export function SuggestionList({
  items,
  onPick,
}: {
  items: SearchSuggestion[];
  onPick: (item: SearchSuggestion) => void;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      {...PREMIUM_LIST}
      keyboardShouldPersistTaps="handled"
      style={s.list}
      renderItem={({ item }) => <SuggestionRow item={item} onPress={onPick} />}
    />
  );
}

type ResultItem =
  | { type: 'header'; label: string }
  | { type: 'restaurant'; data: SearchRestaurant }
  | { type: 'dish'; data: SearchDish };

export function SearchResults({
  query,
  loading,
  restaurants,
  dishes,
  onRestaurant,
  onDish,
}: {
  query: string;
  loading: boolean;
  restaurants: SearchRestaurant[] | undefined;
  dishes: SearchDish[] | undefined;
  onRestaurant: (r: SearchRestaurant) => void;
  onDish: (d: SearchDish) => void;
}) {
  const data = useMemo<ResultItem[]>(() => {
    const out: ResultItem[] = [];
    if (restaurants?.length) {
      out.push({ type: 'header', label: 'Restaurants' });
      restaurants.forEach((r) => out.push({ type: 'restaurant', data: r }));
    }
    if (dishes?.length) {
      out.push({ type: 'header', label: 'Dishes' });
      dishes.forEach((d) => out.push({ type: 'dish', data: d }));
    }
    return out;
  }, [restaurants, dishes]);

  if (loading && data.length === 0) return <ResultSkeleton />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item, i) => (item.type === 'header' ? `h-${item.label}` : `${item.type}-${item.data.id}-${i}`)}
      {...PREMIUM_LIST}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.resultsList}
      ListEmptyComponent={
        <View style={s.emptyWrap}>
          <Search color={MUTED} size={40} strokeWidth={1.5} />
          <Text style={s.emptyText}>No results for “{query}”</Text>
          <Text style={s.emptySubtext}>Try a different spelling or keyword</Text>
        </View>
      }
      renderItem={({ item }) => {
        if (item.type === 'header') return <Text style={s.resultSectionHeader}>{item.label}</Text>;
        if (item.type === 'restaurant') return <RestaurantRow restaurant={item.data} onPress={() => onRestaurant(item.data)} />;
        return <DishRow dish={item.data} onPress={() => onDish(item.data)} />;
      }}
    />
  );
}

export function SearchIdle() {
  return (
    <View style={s.idleWrap}>
      <TrendingUp color={ORANGE} size={36} strokeWidth={1.8} />
      <Text style={s.idleText}>Search for your favourite food</Text>
      <Text style={s.idleSubtext}>Restaurants, dishes, cuisines — find anything</Text>
    </View>
  );
}
