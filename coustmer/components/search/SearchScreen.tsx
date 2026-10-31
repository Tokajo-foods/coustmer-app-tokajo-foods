import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { navigateBack } from '@/lib/motion/navigate-back';
import { useMorphBackHandler, useSearchMorph } from '@/lib/motion/use-search-morph';
import { openRestaurantMenu } from '@/lib/restaurant/open-restaurant';
import { useDebouncedValue, useSearchCombined, useSearchScope, useSearchSuggestions } from '@/lib/search/hooks';
import { openSearchDish } from '@/lib/search/open-search-dish';
import {
  clearLocalRecentSearches,
  loadLocalRecentSearches,
  pushLocalRecentSearch,
  removeLocalRecentSearch,
} from '@/lib/search/recent';
import type { SearchCategorySource, SearchSuggestion } from '@/lib/search/types';
import { useVoiceSearch } from '@/lib/search/use-voice-search';

import { SearchHeader } from './SearchHeader';
import { SearchMorphGhost } from './SearchMorphGhost';
import { SearchDiscover } from './discover/SearchDiscover';
import { SearchMessage, SearchResults } from './SearchSections';
import { searchStyles as s } from './search-styles';
import { SuggestionSections } from './suggest/SuggestionSections';

function errorText(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? error.message : 'Please try again.';
}

export function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const scope = useSearchScope();

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 180);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);
  const morph = useSearchMorph(focusInput);
  const leave = useCallback(() => navigateBack(router, '/home'), [router]);
  const goBack = useCallback(() => morph.close(leave), [morph, leave]);
  useMorphBackHandler(morph.close, leave);

  const suggestions = useSearchSuggestions(debouncedQuery, { enabled: !submitted });
  const combined = useSearchCombined(query, { enabled: submitted });

  useEffect(() => {
    loadLocalRecentSearches().then(setRecentSearches);
  }, []);

  const remember = useCallback((term: string) => {
    pushLocalRecentSearch(term).then(setRecentSearches);
  }, []);

  const performSearch = useCallback((term: string) => {
    const cleaned = term.trim();
    if (!cleaned) return;
    setQuery(cleaned);
    setSubmitted(true);
    Keyboard.dismiss();
    remember(cleaned);
  }, [remember]);

  const voice = useVoiceSearch({
    onPartial: (text) => {
      setQuery(text);
      setSubmitted(false);
    },
    onFinal: performSearch,
  });
  const toggleVoice = useCallback(() => {
    if (!voice.listening) Keyboard.dismiss();
    voice.toggle();
  }, [voice]);

  const openRestaurant = useCallback((id: string) => openRestaurantMenu(router, id), [router]);

  const openCategory = useCallback((c: { slug: string; name: string; source?: SearchCategorySource }) => {
    router.push({ pathname: '/search-category', params: { slug: c.slug, name: c.name, source: c.source ?? '' } });
  }, [router]);

  const fillQuery = useCallback((text: string) => {
    setQuery(text);
    setSubmitted(false);
    inputRef.current?.focus();
  }, []);

  const openSuggestion = useCallback((item: SearchSuggestion) => {
    if (item.type === 'query') return performSearch(item.text);
    remember(item.text);
    if (item.type === 'restaurant' && item.restaurantId) return openRestaurant(item.restaurantId);
    if (item.type === 'dish' && item.restaurantId && item.dishId) {
      return openSearchDish(router, {
        restaurantId: item.restaurantId,
        id: item.dishId,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
      });
    }
    if (item.type === 'category' && item.slug) return openCategory({ slug: item.slug, name: item.text, source: item.source });
    performSearch(item.text);
  }, [openCategory, openRestaurant, performSearch, remember, router]);

  const typed = query.trim();
  const showingDiscover = !submitted && typed.length === 0;
  const showingSuggestions = !submitted && typed.length >= 1;
  const showingResults = submitted && typed.length >= 1;
  const suggestionItems = suggestions.data?.suggestions ?? [];
  const waitingForTyping = debouncedQuery.trim() !== typed || suggestions.isFetching;

  return (
    <View ref={morph.rootRef} collapsable={false} style={s.root}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.backdrop, morph.backdropStyle]} />
      <SafeAreaView style={s.safe} edges={['top']}>
        <SearchHeader
          ref={inputRef}
          morph={morph}
          query={query}
          onChange={(t) => {
            if (voice.listening) voice.cancel();
            setQuery(t);
            setSubmitted(false);
          }}
          onSubmit={() => performSearch(query)}
          onClear={() => {
            if (voice.listening) voice.cancel();
            setQuery('');
            setSubmitted(false);
          }}
          onBack={() => {
            voice.cancel();
            goBack();
          }}
          voice={{ ...voice, toggle: toggleVoice }}
        />
        <Animated.View style={[s.body, morph.bodyStyle]}>
          {showingDiscover ? (
            <SearchDiscover
              recent={recentSearches}
              onSearch={performSearch}
              onRemoveRecent={(term) => removeLocalRecentSearch(term).then(setRecentSearches)}
              onClearRecent={() => clearLocalRecentSearches().then(() => setRecentSearches([]))}
            />
          ) : null}
          {!scope && !showingDiscover ? (
            <SearchMessage kind="empty" title="Set your delivery location"
              body="Search shows restaurants and dishes that deliver to your address." />
          ) : null}
          {scope && showingSuggestions ? (
            suggestions.isError && !suggestionItems.length ? (
              <SearchMessage kind="error" title="Couldn't load suggestions"
                body={errorText(suggestions.error) ?? ''} onRetry={() => void suggestions.refetch()} />
            ) : !suggestionItems.length && !waitingForTyping && suggestions.isFetched ? (
              <SearchMessage kind="empty" title={`Nothing near you for “${typed}”`}
                body="Try a dish, a category like “Burgers”, or a restaurant name." />
            ) : (
              <SuggestionSections
                query={query}
                items={suggestionItems}
                correctedQuery={suggestions.data?.correctedQuery}
                onPick={openSuggestion}
                onFill={fillQuery}
                onSearchAll={() => performSearch(query)}
              />
            )
          ) : null}
          {scope && showingResults ? (
            <SearchResults
              query={typed}
              loading={combined.isLoading}
              error={combined.isError ? errorText(combined.error) : null}
              onRetry={() => void combined.refetch()}
              correctedQuery={combined.data?.correctedQuery}
              categories={combined.data?.categories ?? []}
              restaurants={combined.data?.restaurants ?? []}
              dishes={combined.data?.dishes ?? []}
              onCategory={openCategory}
              onRestaurant={(r) => openRestaurant(r.id)}
              onDish={(d) => openSearchDish(router, d)}
            />
          ) : null}
        </Animated.View>
      </SafeAreaView>
      <SearchMorphGhost morph={morph} />
    </View>
  );
}
