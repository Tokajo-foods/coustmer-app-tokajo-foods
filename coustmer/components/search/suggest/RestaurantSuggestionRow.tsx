import { Image } from 'expo-image';
import { Star, Store } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { SearchSuggestion } from '@/lib/search/types';

import { HighlightedText } from '../HighlightedText';
import { suggestRipple, suggestStyles as s } from './suggest-styles';

export const RestaurantSuggestionRow = memo(function RestaurantSuggestionRow({ item, query, onPress }: {
  item: SearchSuggestion;
  query: string;
  onPress: (item: SearchSuggestion) => void;
}) {
  const closed = item.isOpen === false || (item.subtitle?.endsWith('Closed now') ?? false);
  const cuisines = item.subtitle?.replace(/\s*·\s*Closed now$/, '') || 'Restaurant';
  return (
    <Pressable
      style={s.row}
      android_ripple={suggestRipple}
      onPress={() => onPress(item)}
      accessibilityLabel={`Restaurant ${item.text}`}
    >
      <View style={s.thumb}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={s.image} contentFit="cover" transition={150} />
        ) : (
          <Store color="#A1A1AA" size={20} strokeWidth={1.8} />
        )}
      </View>
      <View style={s.info}>
        <HighlightedText text={item.text} query={query} style={s.name} highlightStyle={s.hit} />
        <Text style={s.meta} numberOfLines={1}>
          {cuisines}
          {closed ? <Text style={s.closed}>{'  ·  Closed now'}</Text> : null}
        </Text>
      </View>
      {item.rating ? (
        <View style={s.rating}>
          <Text style={s.ratingText}>{item.rating.toFixed(1)}</Text>
          <Star color="#FFFFFF" fill="#FFFFFF" size={9} />
        </View>
      ) : null}
    </Pressable>
  );
});
