import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { navigateBack } from '@/lib/motion/navigate-back';
import { useMorphBackHandler, useSearchMorph } from '@/lib/motion/use-search-morph';
import { openRestaurantMenu } from '@/lib/restaurant/open-restaurant';
import { useDebouncedValue, useSearchCombined, useSearchSuggestions } from '@/lib/search/hooks';
import {
  clearLocalRecentSearches,
  loadLocalRecentSearches,
  pushLocalRecentSearch,
  removeLocalRecentSearch,
} from '@/lib/search/recent';
import type { SearchSuggestion } from '@/lib/search/types';
import { useDeliveryCoords } from '@/store/delivery-location-store';

import { SearchHeader } from './SearchHeader';
import { SearchMorphGhost } from './SearchMorphGhost';
import { SearchDiscover } from './discover/SearchDiscover';
import { SearchResults, SuggestionList } from './SearchSections';
import { searchStyles as s } from './search-styles';

/** search-service radius is meters; discovery radius is km. */
const SUGGEST_RADIUS_M = CUSTOMER_DISCOVERY_RADIUS_KM * 1000;

export function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const coords = useDeliveryCoords();

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);
  const morph = useSearchMorph(focusInput);
  const leave = useCallback(() => navigateBack(router, '/home'), [router]);
  const goBack = useCallback(() => morph.close(leave), [morph, leave]);
  useMorphBackHandler(morph.close, leave);

  const suggestions = useSearchSuggestions(
    {
      q: debouncedQuery,
      limit: 10,
      lat: coords?.lat,
      lng: coords?.lng,
      radius: coords ? SUGGEST_RADIUS_M : undefined,
    },
    { enabled: !submitted && debouncedQuery.length >= 1 }
  );
  const combined = useSearchCombined(
    { q: debouncedQuery, lat: coords?.lat, lng: coords?.lng },
    { enabled: submitted && debouncedQuery.length >= 1 }
  );

  useEffect(() => {
    loadLocalRecentSearches().then(setRecentSearches);
  }, []);

  const performSearch = useCallback((term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    setQuery(cleaned);
    setSubmitted(true);
    Keyboard.dismiss();
    pushLocalRecentSearch(cleaned).then(setRecentSearches);
  }, []);

  const openRestaurant = useCallback((id: string, itemId?: string) => {
    openRestaurantMenu(router, id, { params: itemId ? { itemId } : undefined });
  }, [router]);

  const openSuggestion = useCallback((item: SearchSuggestion) => {
    if (item.type === 'restaurant' && (item.restaurantId || item.id)) {
      openRestaurant(item.restaurantId || item.id);
      return;
    }
    if (item.type === 'dish' && item.restaurantId) {
      openRestaurant(item.restaurantId, item.dishId || item.id);
      return;
    }
    performSearch(item.text);
  }, [openRestaurant, performSearch]);

  const showingResults = submitted && debouncedQuery.length >= 1;
  const suggestionItems = suggestions.data?.suggestions ?? [];
  const showingSuggestions = !submitted && query.trim().length >= 1;
  const showingDiscover = !submitted && query.trim().length === 0;

  return (
    <View ref={morph.rootRef} collapsable={false} style={s.root}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.backdrop, morph.backdropStyle]} />
      <SafeAreaView style={s.safe} edges={['top']}>
        <SearchHeader
          ref={inputRef}
          morph={morph}
          query={query}
          onChange={(t) => {
            setQuery(t);
            setSubmitted(false);
          }}
          onSubmit={() => performSearch(query)}
          onClear={() => {
            setQuery('');
            setSubmitted(false);
          }}
          onBack={goBack}
        />
        <Animated.View style={[s.body, morph.bodyStyle]}>
          {showingDiscover ? (
            <SearchDiscover
              recent={recentSearches}
              onSearch={performSearch}
              onRemoveRecent={(term) => removeLocalRecentSearch(term).then(setRecentSearches)}
              onClearRecent={() => clearLocalRecentSearches().then(() => setRecentSearches([]))}
              onDish={(dish) => openRestaurant(dish.restaurantId, dish.id)}
              onRestaurant={(r) => openRestaurant(r.id)}
            />
          ) : null}
          {showingSuggestions ? (
            <SuggestionList
              query={query}
              items={suggestionItems}
              onPick={openSuggestion}
              onSearchAll={() => performSearch(query)}
            />
          ) : null}
          {showingResults ? (
            <SearchResults
              query={query}
              loading={combined.isLoading}
              restaurants={combined.data?.restaurants}
              dishes={combined.data?.dishes}
              onRestaurant={(r) => openRestaurant(r.id)}
              onDish={(d) => openRestaurant(d.restaurantId, d.id)}
            />
          ) : null}
        </Animated.View>
      </SafeAreaView>
      <SearchMorphGhost morph={morph} />
    </View>
  );
}
