import { Image } from 'expo-image';
import { UtensilsCrossed } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatInr } from '@/lib/format/money';
import type { SearchSuggestion } from '@/lib/search/types';

import { HighlightedText } from '../HighlightedText';
import { suggestRipple, suggestStyles as s } from './suggest-styles';

export const DishSuggestionRow = memo(function DishSuggestionRow({ item, query, onPress }: {
  item: SearchSuggestion;
  query: string;
  onPress: (item: SearchSuggestion) => void;
}) {
  const closed = item.subtitle?.endsWith('Closed now') ?? false;
  const restaurant = item.restaurantName ?? item.subtitle?.replace(/\s*·\s*Closed now$/, '') ?? '';
  return (
    <Pressable
      style={s.row}
      android_ripple={suggestRipple}
      onPress={() => onPress(item)}
      accessibilityLabel={`Dish ${item.text}${restaurant ? ` from ${restaurant}` : ''}`}
    >
      <View style={s.thumb}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={s.image} contentFit="cover" transition={150} />
        ) : (
          <UtensilsCrossed color="#A1A1AA" size={20} strokeWidth={1.8} />
        )}
      </View>
      <View style={s.info}>
        <View style={s.titleRow}>
          {item.isVeg !== undefined ? (
            <View style={[s.veg, !item.isVeg && s.nonVeg]}>
              <View style={[s.vegDot, !item.isVeg && s.nonVegDot]} />
            </View>
          ) : null}
          <HighlightedText text={item.text} query={query} style={s.name} highlightStyle={s.hit} />
        </View>
        <Text style={s.meta} numberOfLines={1}>
          {restaurant ? <>from <Text style={s.metaStrong}>{restaurant}</Text></> : 'Dish'}
          {closed ? <Text style={s.closed}>{'  ·  Closed now'}</Text> : null}
        </Text>
      </View>
      {item.price ? (
        <View style={s.trailing}>
          <Text style={s.price}>{formatInr(item.price)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
});
