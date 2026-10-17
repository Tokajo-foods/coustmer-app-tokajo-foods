import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { HomeRestaurantCard } from '@/lib/home/types';

import { searchColors } from '../search-styles';
import { DiscoverSection } from './DiscoverSection';

function metaLine(r: HomeRestaurantCard): string {
  const parts: string[] = [];
  if (r.deliveryTime) parts.push(r.deliveryTime);
  if (typeof r.distanceKm === 'number' && r.distanceKm > 0) parts.push(`${r.distanceKm.toFixed(1)} km`);
  return parts.join(' · ');
}

/** Open, most-rated restaurants that deliver to the pin. */
export function NearbyRestaurantList({
  items,
  onPick,
}: {
  items: HomeRestaurantCard[];
  onPick: (r: HomeRestaurantCard) => void;
}) {
  if (!items.length) return null;
  return (
    <DiscoverSection title="Popular restaurants near you" subtitle="Delivering to your location">
      <View style={styles.list}>
        {items.map((r) => {
          const closed = r.isOpenNow === false;
          const meta = metaLine(r);
          return (
            <Pressable
              key={r.id}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => onPick(r)}
              accessibilityLabel={r.name}
            >
              <View style={styles.thumb}>
                {r.image || r.logoUrl ? (
                  <Image
                    source={{ uri: (r.image || r.logoUrl) as string }}
                    style={[styles.image, closed && styles.dim]}
                    contentFit="cover"
                    transition={180}
                  />
                ) : (
                  <Text style={styles.letter}>{r.name.charAt(0)}</Text>
                )}
              </View>
              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={styles.name} numberOfLines={1}>{r.name}</Text>
                  {r.rating ? (
                    <View style={styles.rating}>
                      <Star color="#FFFFFF" fill="#FFFFFF" size={9} />
                      <Text style={styles.ratingText}>{r.rating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                </View>
                {r.cuisines?.length ? (
                  <Text style={styles.meta} numberOfLines={1}>{r.cuisines.slice(0, 3).join(', ')}</Text>
                ) : null}
                <Text style={[styles.meta, closed && styles.closed]} numberOfLines={1}>
                  {closed ? r.availabilityLabel || 'Closed now' : meta}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </DiscoverSection>
  );
}

const styles = StyleSheet.create({
  list: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderRadius: 14 },
  pressed: { backgroundColor: '#F8FAFC' },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  dim: { opacity: 0.5 },
  letter: { fontFamily: fonts.displayBold, fontSize: 22, color: '#FFFFFF' },
  info: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontFamily: fonts.displayBold, fontSize: 15, color: searchColors.ink },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: { fontFamily: fonts.uiBold, fontSize: 11, color: '#FFFFFF' },
  meta: { fontFamily: fonts.ui, fontSize: 12.5, color: searchColors.muted },
  closed: { color: '#DC2626' },
});
