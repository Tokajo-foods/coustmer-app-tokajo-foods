import { Image } from 'expo-image';
import { ArrowUpLeft, ChefHat, Star, Store, UtensilsCrossed } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { formatInr } from '@/lib/format/money';
import type { SearchSuggestion } from '@/lib/search/types';

import { HighlightedText } from './HighlightedText';
import { searchColors } from './search-styles';

const KIND: Record<SearchSuggestion['type'], { label: string; Icon: typeof Store }> = {
  dish: { label: 'Dish', Icon: UtensilsCrossed },
  restaurant: { label: 'Restaurant', Icon: Store },
  category: { label: 'Cuisine', Icon: ChefHat },
};

function kindLabel(item: SearchSuggestion): string {
  if (item.type === 'category' && item.source === 'food_category') return 'Category';
  return KIND[item.type].label;
}

/** Server subtitles for categories start with the kind ("Cuisine · 3 restaurants"); the row shows the kind already. */
function subtitleFor(item: SearchSuggestion): string {
  const raw = item.subtitle?.replace(/^(category|cuisine)\s*·\s*/i, '');
  if (raw) return raw;
  if (item.type === 'dish') return item.restaurantName ?? 'Dish';
  return item.type === 'category' ? 'Near you' : 'Restaurant';
}

/** One type-ahead row: thumbnail, name with typed words in bold, and what it is. */
export const SuggestionRow = memo(function SuggestionRow({
  item,
  query,
  onPress,
  onFill,
}: {
  item: SearchSuggestion;
  query: string;
  onPress: (item: SearchSuggestion) => void;
  /** Puts the suggestion text in the field without opening it. */
  onFill: (text: string) => void;
}) {
  const { Icon } = KIND[item.type];
  const label = kindLabel(item);
  const round = item.type === 'category';
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress(item)}
      accessibilityLabel={`${label}: ${item.text}`}
    >
      <View style={[styles.thumb, round && styles.round]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" transition={150} />
        ) : (
          <Icon color="#71717A" size={18} strokeWidth={2} />
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          {item.type === 'dish' && item.isVeg !== undefined ? (
            <View style={[styles.veg, !item.isVeg && styles.nonVeg]}>
              <View style={[styles.vegDot, !item.isVeg && styles.nonVegDot]} />
            </View>
          ) : null}
          <HighlightedText text={item.text} query={query} style={styles.name} highlightStyle={styles.hit} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.kind}>{label}</Text>
          <Text style={styles.meta} numberOfLines={1}>· {subtitleFor(item)}</Text>
          {item.type === 'dish' && item.price ? <Text style={styles.price}>{formatInr(item.price)}</Text> : null}
          {item.type === 'restaurant' && item.rating ? (
            <View style={styles.rating}>
              <Star color="#FFFFFF" fill="#FFFFFF" size={8} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Pressable onPress={() => onFill(item.text)} hitSlop={10} accessibilityLabel={`Search ${item.text}`}>
        <ArrowUpLeft color="#A1A1AA" size={18} strokeWidth={2} />
      </Pressable>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  pressed: { backgroundColor: '#F8FAFC' },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  round: { borderRadius: 22 },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontFamily: fonts.ui, fontSize: 15, color: '#3F3F46' },
  hit: { fontFamily: fonts.uiBold, color: searchColors.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kind: { fontFamily: fonts.uiMedium, fontSize: 12, color: searchColors.orange },
  meta: { flexShrink: 1, fontFamily: fonts.ui, fontSize: 12, color: searchColors.muted },
  price: { fontFamily: fonts.uiMedium, fontSize: 12, color: '#3F3F46', marginLeft: 4 },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  ratingText: { fontFamily: fonts.uiBold, fontSize: 10, color: '#FFFFFF' },
  veg: {
    width: 13,
    height: 13,
    borderRadius: 2,
    borderWidth: 1.3,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVeg: { borderColor: '#DC2626' },
  vegDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#16A34A' },
  nonVegDot: { backgroundColor: '#DC2626' },
});
