import { Pressable } from '@/components/common/Pressable';
import { Image } from 'expo-image';
import { Search, UtensilsCrossed } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { VegBadge } from '@/components/restaurant/MenuBadges';
import { fonts } from '@/constants/typography';
import { resolveMenuItemImage } from '@/lib/restaurant/menu-item-images';
import type { MenuItem } from '@/lib/restaurant/types';
import { formatInr } from '@/lib/format/money';

const ORANGE = '#F97316';
const INK = '#0B1220';
const MUTED = '#64748B';

type Props = {
  visible: boolean;
  query: string;
  restaurantName?: string;
  suggestions: MenuItem[];
  totalMatches: number;
  onSelectItem: (item: MenuItem) => void;
  onFillQuery: (text: string) => void;
};

export function RestaurantMenuAutocomplete({
  visible,
  query,
  restaurantName,
  suggestions,
  totalMatches,
  onSelectItem,
  onFillQuery,
}: Props) {
  if (!visible || suggestions.length === 0) return null;

  const trimmed = query.trim();
  const title = trimmed
    ? `In ${restaurantName ?? 'this menu'}`
    : 'Popular on this menu';

  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <Search color={MUTED} size={14} strokeWidth={2.4} />
        <Text style={styles.panelTitle}>{title}</Text>
        {trimmed ? (
          <Text style={styles.panelMeta}>
            {totalMatches} match{totalMatches === 1 ? '' : 'es'}
          </Text>
        ) : null}
      </View>

      {suggestions.map((item, index) => {
        const photo = resolveMenuItemImage(item.name, item.imageUrl);
        const isLast = index === suggestions.length - 1;
        return (
          <Pressable
            key={item.id}
            style={[styles.row, !isLast && styles.rowBorder]}
            onPress={() => onSelectItem(item)}
          >
            <View style={styles.thumb}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.thumbImg} contentFit="cover" />
              ) : (
                <View style={[styles.thumbImg, styles.thumbFallback]}>
                  <UtensilsCrossed color="#94A3B8" size={16} />
                </View>
              )}
            </View>
            <View style={styles.copy}>
              <View style={styles.nameRow}>
                <VegBadge isVeg={item.isVeg} />
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              </View>
              {item.categoryName ? (
                <Text style={styles.category} numberOfLines={1}>
                  {item.categoryName}
                </Text>
              ) : null}
            </View>
            <Text style={styles.price}>{formatInr(item.price)}</Text>
          </Pressable>
        );
      })}

      {trimmed && totalMatches > suggestions.length ? (
        <Pressable
          style={styles.moreRow}
          onPress={() => onFillQuery(trimmed)}
        >
          <Text style={styles.moreText}>
            View all {totalMatches} results for “{trimmed}”
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    overflow: 'hidden',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FAFBFC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDF3',
  },
  panelTitle: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: INK,
  },
  panelMeta: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: MUTED,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  thumbImg: {
    width: 44,
    height: 44,
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: INK,
  },
  category: {
    marginTop: 2,
    marginLeft: 22,
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: MUTED,
  },
  price: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: ORANGE,
  },
  moreRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8EDF3',
    backgroundColor: '#FFFBF5',
  },
  moreText: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: ORANGE,
    textAlign: 'center',
  },
});
