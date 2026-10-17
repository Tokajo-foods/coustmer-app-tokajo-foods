import { Pressable } from '@/components/common/Pressable';
import { Image } from 'expo-image';
import { UtensilsCrossed } from 'lucide-react-native';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { VegBadge } from '@/components/restaurant/MenuBadges';
import { fonts } from '@/constants/typography';
import { resolveMenuItemImage } from '@/lib/restaurant/menu-item-images';
import type { MenuItem } from '@/lib/restaurant/types';
import { formatInr } from '@/lib/format/money';

const ORANGE = '#F97316';
const INK = '#0B1220';
const MUTED = '#64748B';
const CARD_W = Math.min(152, Math.round(Dimensions.get('window').width * 0.4));
const CARD_GAP = 10;

type Props = {
  title: string;
  subtitle: string;
  items: MenuItem[];
  onPressItem: (item: MenuItem) => void;
  onAddItem: (item: MenuItem) => void;
};

function pickBadge(item: MenuItem): string | null {
  if (item.isRecommended) return "Chef's pick";
  if (item.isBestSeller) return 'Bestseller';
  return null;
}

function PopularDishCard({
  item,
  index,
  onPress,
  onAdd,
}: {
  item: MenuItem;
  index: number;
  onPress: () => void;
  onAdd: () => void;
}) {
  const badge = pickBadge(item);
  const photo = resolveMenuItemImage(item.name, item.imageUrl);

  return (
    <Animated.View entering={FadeInRight.delay(30 + index * 35).duration(280)}>
      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.imageWrap}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <UtensilsCrossed color="#94A3B8" size={22} strokeWidth={1.8} />
            </View>
          )}
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText} numberOfLines={1}>{badge}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <VegBadge isVeg={item.isVeg} />
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.price}>{formatInr(item.price)}</Text>
            <Pressable
              style={styles.addBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                onAdd();
              }}
              hitSlop={6}
            >
              <Text style={styles.addText}>ADD</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function RestaurantPopularPicks({
  title,
  subtitle,
  items,
  onPressItem,
  onAddItem,
}: Props) {
  if (!items.length) return null;

  return (
    <Animated.View entering={FadeInDown.delay(50).duration(320)} style={styles.block}>
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + CARD_GAP}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item, i) => (
          <PopularDishCard
            key={item.id}
            item={item}
            index={i}
            onPress={() => onPressItem(item)}
            onAdd={() => onAddItem(item)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  head: {
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    color: INK,
    letterSpacing: -0.2,
  },
  sub: {
    marginTop: 2,
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: MUTED,
  },
  row: {
    paddingHorizontal: 14,
    gap: CARD_GAP,
    paddingBottom: 6,
  },
  card: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    overflow: 'hidden',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrap: {
    height: 92,
    width: '100%',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    maxWidth: CARD_W - 16,
    backgroundColor: ORANGE,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: fonts.uiBold,
    fontSize: 9,
    color: '#FFF',
    flexShrink: 1,
  },
  body: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    minHeight: 38,
  },
  name: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: INK,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: INK,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFF7ED',
  },
  addText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: ORANGE,
    letterSpacing: 0.3,
  },
});
