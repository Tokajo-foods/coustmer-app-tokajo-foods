import { Image } from 'expo-image';
import { UtensilsCrossed } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { HomeTrendingDish } from '@/lib/home/types';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';

import { searchColors } from '../search-styles';
import { DiscoverSection } from './DiscoverSection';

/** A random mix of dishes from restaurants in range. */
export function DishRail({ items, onPick }: { items: HomeTrendingDish[]; onPick: (dish: HomeTrendingDish) => void }) {
  if (!items.length) return null;
  return (
    <DiscoverSection title="Popular dishes near you" subtitle="From restaurants that deliver here" flush>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(d) => `${d.restaurantId}-${d.id}`}
        {...PREMIUM_HORIZONTAL_LIST}
        contentContainerStyle={styles.rail}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => onPick(item)}
            accessibilityLabel={`${item.name} from ${item.restaurantName}`}
          >
            <View style={styles.media}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" transition={180} />
              ) : (
                <UtensilsCrossed color="#CBD5E1" size={26} />
              )}
              {item.isVeg !== undefined ? (
                <View style={[styles.vegBox, !item.isVeg && styles.nonVegBox]}>
                  <View style={[styles.vegDot, !item.isVeg && styles.nonVegDot]} />
                </View>
              ) : null}
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>{item.restaurantName}</Text>
              {item.price > 0 ? <Text style={styles.price}>₹{Math.round(item.price)}</Text> : null}
            </View>
          </Pressable>
        )}
      />
    </DiscoverSection>
  );
}

const styles = StyleSheet.create({
  rail: { paddingHorizontal: 16, gap: 12 },
  card: {
    width: 148,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  media: { height: 104, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  vegBox: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVegBox: { borderColor: '#DC2626' },
  vegDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16A34A' },
  nonVegDot: { backgroundColor: '#DC2626' },
  info: { padding: 10, gap: 2 },
  name: { fontFamily: fonts.uiSemi, fontSize: 13.5, color: searchColors.ink },
  meta: { fontFamily: fonts.ui, fontSize: 11.5, color: searchColors.muted },
  price: { fontFamily: fonts.uiSemi, fontSize: 13, color: searchColors.ink, marginTop: 4 },
});
