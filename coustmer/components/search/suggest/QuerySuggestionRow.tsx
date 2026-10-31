import { ArrowUpLeft, Search } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { SearchSuggestion } from '@/lib/search/types';

import { HighlightedText } from '../HighlightedText';
import { suggestRipple, suggestStyles as s } from './suggest-styles';

/** Autocomplete completion: tap searches it, the arrow puts it in the box to keep typing. */
export const QuerySuggestionRow = memo(function QuerySuggestionRow({ item, query, onPress, onFill }: {
  item: SearchSuggestion;
  query: string;
  onPress: (item: SearchSuggestion) => void;
  onFill?: (text: string) => void;
}) {
  return (
    <Pressable
      style={[s.row, s.queryRow]}
      android_ripple={suggestRipple}
      onPress={() => onPress(item)}
      accessibilityLabel={`Search ${item.text}`}
    >
      <View style={s.queryIcon}>
        <Search color="#71717A" size={17} strokeWidth={2.2} />
      </View>
      <View style={s.info}>
        <HighlightedText text={item.text} query={query} style={s.name} highlightStyle={s.hit} />
      </View>
      {onFill ? (
        <Pressable
          onPress={() => onFill(item.text)}
          hitSlop={10}
          style={s.fillBtn}
          accessibilityLabel={`Use ${item.text} in search box`}
        >
          <ArrowUpLeft color="#A1A1AA" size={18} strokeWidth={2} />
        </Pressable>
      ) : null}
    </Pressable>
  );
});
