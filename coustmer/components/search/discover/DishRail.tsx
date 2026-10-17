import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, UtensilsCrossed } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { HomeTrendingDish } from '@/lib/home/types';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';

import { searchColors } from '../search-styles';
import { DiscoverSection } from './DiscoverSection';

function VegMark({ veg }: { veg: boolean }) {
  return (
    <View style={[styles.vegBox, !veg && styles.nonVegBox]}>
      <View style={[styles.vegDot, !veg && styles.nonVegDot]} />
    </View>
  );
}

/** Ordered-most and sampled dishes from restaurants in range. */
export function DishRail({ items, onPick }: { items: HomeTrendingDish[]; onPick: (dish: HomeTrendingDish) => void }) {
  if (!items.length) return null;
  return (
    <DiscoverSection
      title="Popular dishes near you"
      subtitle="Loved by people around you"
      icon={<Flame color={searchColors.orange} size={17} strokeWidth={2.4} />}
      flush
    >
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
                <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" transition={200} />
              ) : (
                <UtensilsCrossed color="#FDBA74" size={30} />
              )}
              <LinearGradient colors={['transparent', 'rgba(15,23,42,0.55)']} style={styles.shade} />
              {item.isVeg !== undefined ? <VegMark veg={item.isVeg} /> : null}
              {item.price > 0 ? (
                <View style={styles.pricePill}>
                  <Text style={styles.price}>₹{Math.round(item.price)}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>{item.restaurantName}</Text>
            </View>
          </Pressable>
        )}
      />
    </DiscoverSection>
  );
}

const styles = StyleSheet.create({
  rail: { paddingHorizontal: 16, paddingBottom: 6, gap: 12 },
  card: {
    width: 156,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  media: {
    height: 118,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: searchColors.peach,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { ...StyleSheet.absoluteFillObject },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 52 },
  vegBox: {
    position: 'absolute',
    top: 9,
    left: 9,
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
  pricePill: {
    position: 'absolute',
    left: 9,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  price: { fontFamily: fonts.uiBold, fontSize: 12.5, color: searchColors.ink },
  info: { paddingHorizontal: 11, paddingTop: 9, paddingBottom: 11, gap: 2 },
  name: { fontFamily: fonts.displayBold, fontSize: 14, color: searchColors.ink },
  meta: { fontFamily: fonts.ui, fontSize: 12, color: searchColors.muted },
});
