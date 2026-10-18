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
  const parts = (item.subtitle ?? '').split(' · ');
  const trailing = parts.length > 1 ? parts[parts.length - 1] : '';
  const knownStatus =
    trailing === 'Closed now' ||
    trailing === 'Restaurant is offline' ||
    trailing.startsWith('On a break');
  const status = knownStatus
    ? trailing
    : item.isOpen === false
      ? 'Closed now'
      : null;
  const cuisines = knownStatus
    ? parts.slice(0, -1).join(' · ') || 'Restaurant'
    : item.subtitle || 'Restaurant';
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
          {status ? <Text style={s.closed}>{`  ·  ${status}`}</Text> : null}
        </Text>
      </View>
      {item.rating ? (
        <View style={s.rating}>
          <Text style={s.ratingText}>{item.rating.toFixed(1)}</Text>
          <Star color="#FFFFFF" fill="#FFFFFF" size={9} />
        </View>
      ) : (
        <Text style={s.meta}>No ratings</Text>
      )}
    </Pressable>
  );
});
