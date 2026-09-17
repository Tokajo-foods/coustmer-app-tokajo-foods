import { Image } from 'expo-image';
import { Heart, Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { SmoothPressable } from '@/components/common/SmoothPressable';
import { fonts } from '@/constants/typography';
import type { HomeTrendingDish } from '@/lib/home/types';

const ORANGE = '#F97316';
const GREEN = '#16A34A';

function badgeStyle(badge?: string | null): { text: string; green: boolean } | null {
  if (!badge) return null;
  const text = String(badge).trim();
  if (!text) return null;
  const isDiscount = /off|%|deal|save/i.test(text);
  return { text, green: isDiscount };
}

type Props = {
  dish: HomeTrendingDish;
  isFavorite?: boolean;
  onToggleFavorite?: (restaurantId: string) => void;
  onPress: (restaurantId: string) => void;
};

/** Trending / Order-again dish card with badge, heart and quick-add. */
export function TokajoDishCard({
  dish,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) {
  const badge = badgeStyle(dish.badge);

  return (
    <Pressable style={styles.card} onPress={() => onPress(dish.restaurantId)}>
      <View style={styles.imageWrap}>
        {dish.imageUrl ? (
          <Image
            source={{ uri: dish.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.image, styles.imageEmpty]} />
        )}

        {badge ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: badge.green ? GREEN : ORANGE },
            ]}
          >
            <Text style={styles.badgeText} numberOfLines={1}>
              {badge.text}
            </Text>
          </View>
        ) : null}

        <SmoothPressable
          style={styles.heart}
          pressScale={0.9}
          onPress={() => onToggleFavorite?.(dish.restaurantId)}
          accessibilityLabel="Save"
        >
          <Heart
            color={isFavorite ? '#EF4444' : '#8A8A8A'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            size={15}
            strokeWidth={2.4}
          />
        </SmoothPressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {dish.name}
        </Text>
        <Text style={styles.restaurant} numberOfLines={1}>
          {dish.restaurantName}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{Math.round(dish.price)}</Text>
          <SmoothPressable
            style={styles.addBtn}
            pressScale={0.9}
            onPress={() => onPress(dish.restaurantId)}
            accessibilityLabel={`Add ${dish.name}`}
          >
            <Plus color="#FFFFFF" size={16} strokeWidth={3} />
          </SmoothPressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 152,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  imageWrap: {
    height: 112,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageEmpty: {
    backgroundColor: '#EFEFEF',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.uiBold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 10,
    gap: 2,
  },
  name: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: '#1C1C1C',
  },
  restaurant: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: '#9A9A9A',
  },
  priceRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: '#1C1C1C',
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
