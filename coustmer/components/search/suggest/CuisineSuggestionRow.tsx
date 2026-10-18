import { Image } from 'expo-image';
import { ChefHat, ChevronRight } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { SearchSuggestion } from '@/lib/search/types';

import { HighlightedText } from '../HighlightedText';
import { searchColors } from '../search-styles';
import { suggestStyles as s } from './suggest-styles';

/** Server subtitles start with the kind ("Cuisine · 3 restaurants"); the section header already says it. */
function countLine(item: SearchSuggestion): string {
  const raw = item.subtitle?.replace(/^(category|cuisine)\s*·\s*/i, '').trim();
  return raw || 'Near you';
}

export const CuisineSuggestionRow = memo(function CuisineSuggestionRow({ item, query, onPress }: {
  item: SearchSuggestion;
  query: string;
  onPress: (item: SearchSuggestion) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.pressed]}
      onPress={() => onPress(item)}
      accessibilityLabel={`All ${item.text} dishes near you`}
    >
      <View style={[s.thumb, s.thumbRound]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={s.image} contentFit="cover" transition={150} />
        ) : (
          <ChefHat color={searchColors.orange} size={20} strokeWidth={1.9} />
        )}
      </View>
      <View style={s.info}>
        <HighlightedText text={item.text} query={query} style={s.name} highlightStyle={s.hit} />
        <Text style={s.meta} numberOfLines={1}>{countLine(item)}</Text>
      </View>
      <ChevronRight color="#A1A1AA" size={18} strokeWidth={2} />
    </Pressable>
  );
});
