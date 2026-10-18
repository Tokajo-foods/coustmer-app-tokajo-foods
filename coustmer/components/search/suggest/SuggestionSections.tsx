import { ArrowRight, Search } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';

import { PREMIUM_LIST } from '@/lib/motion/premium';
import type { SearchSuggestion, SearchSuggestionType } from '@/lib/search/types';

import { searchColors } from '../search-styles';
import { CuisineSuggestionRow } from './CuisineSuggestionRow';
import { DishSuggestionRow } from './DishSuggestionRow';
import { RestaurantSuggestionRow } from './RestaurantSuggestionRow';
import { suggestRipple, suggestStyles as s } from './suggest-styles';

type Section = { key: SearchSuggestionType; title: string; data: SearchSuggestion[] };

const ORDER: { key: SearchSuggestionType; title: string }[] = [
  { key: 'dish', title: 'MENU' },
  { key: 'category', title: 'CUISINES' },
  { key: 'restaurant', title: 'RESTAURANTS' },
];

const ROW = { dish: DishSuggestionRow, category: CuisineSuggestionRow, restaurant: RestaurantSuggestionRow };

/** Type-ahead grouped as Menu → Cuisines → Restaurants, keeping the server's ranking inside each group. */
export function SuggestionSections({ query, items, correctedQuery, onPick, onSearchAll }: {
  query: string;
  items: SearchSuggestion[];
  correctedQuery?: string;
  onPick: (item: SearchSuggestion) => void;
  onSearchAll: () => void;
}) {
  const sections = useMemo<Section[]>(
    () => ORDER
      .map(({ key, title }) => ({ key, title, data: items.filter((i) => i.type === key) }))
      .filter((sec) => sec.data.length > 0),
    [items],
  );
  const highlight = correctedQuery || query;
  const typed = query.trim();

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      {...PREMIUM_LIST}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      stickySectionHeadersEnabled={false}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      ListHeaderComponent={
        correctedQuery ? (
          <Text style={s.corrected}>
            Showing results for <Text style={s.correctedQuery}>{correctedQuery}</Text>
          </Text>
        ) : null
      }
      renderSectionHeader={({ section }) => (
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>{section.title}</Text>
          <Text style={s.sectionCount}>{section.data.length}</Text>
          <View style={s.sectionRule} />
        </View>
      )}
      renderItem={({ item }) => {
        const Row = ROW[item.type];
        return <Row item={item} query={highlight} onPress={onPick} />;
      }}
      ListFooterComponent={
        typed ? (
          <Pressable style={s.seeAll} android_ripple={suggestRipple} onPress={onSearchAll} accessibilityRole="button">
            <View style={s.seeAllIcon}>
              <Search color={searchColors.orange} size={16} strokeWidth={2.4} />
            </View>
            <Text style={s.seeAllText} numberOfLines={1}>
              See all results for <Text style={s.seeAllQuery}>“{typed}”</Text>
            </Text>
            <ArrowRight color="#A1A1AA" size={16} strokeWidth={2.2} />
          </Pressable>
        ) : null
      }
    />
  );
}
