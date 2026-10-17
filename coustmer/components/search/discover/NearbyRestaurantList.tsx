import { Image } from 'expo-image';
import { ChevronRight, Clock, Leaf, MapPin, Star, Store } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { HomeRestaurantCard } from '@/lib/home/types';

import { searchColors } from '../search-styles';
import { DiscoverSection } from './DiscoverSection';

function Row({ r, divided, onPick }: { r: HomeRestaurantCard; divided: boolean; onPick: () => void }) {
  const closed = r.isOpenNow === false;
  const cover = r.image || r.logoUrl;
  const distance = typeof r.distanceKm === 'number' && r.distanceKm > 0 ? `${r.distanceKm.toFixed(1)} km` : '';
  return (
    <Pressable
      style={({ pressed }) => [styles.row, divided && styles.divided, pressed && styles.pressed]}
      onPress={onPick}
      accessibilityLabel={r.name}
    >
      <View style={styles.thumb}>
        {cover ? (
          <Image source={{ uri: cover }} style={[styles.image, closed && styles.dim]} contentFit="cover" transition={200} />
        ) : (
          <Text style={styles.letter}>{r.name.charAt(0)}</Text>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{r.name}</Text>
          {r.isPureVeg ? <Leaf color="#16A34A" size={13} strokeWidth={2.4} /> : null}
        </View>
        {r.cuisines?.length ? (
          <Text style={styles.cuisines} numberOfLines={1}>{r.cuisines.slice(0, 3).join(' • ')}</Text>
        ) : null}
        {closed ? (
          <Text style={styles.closed} numberOfLines={1}>{r.availabilityLabel || 'Closed now'}</Text>
        ) : (
          <View style={styles.metaRow}>
            {r.rating ? (
              <View style={styles.rating}>
                <Star color="#FFFFFF" fill="#FFFFFF" size={9} />
                <Text style={styles.ratingText}>{r.rating.toFixed(1)}</Text>
              </View>
            ) : null}
            {r.deliveryTime ? (
              <View style={styles.meta}>
                <Clock color={searchColors.muted} size={12} strokeWidth={2.2} />
                <Text style={styles.metaText}>{r.deliveryTime}</Text>
              </View>
            ) : null}
            {distance ? (
              <View style={styles.meta}>
                <MapPin color={searchColors.muted} size={12} strokeWidth={2.2} />
                <Text style={styles.metaText}>{distance}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
      <ChevronRight color="#CBD5E1" size={18} />
    </Pressable>
  );
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
    <DiscoverSection
      title="Popular restaurants near you"
      subtitle="Delivering to your location"
      icon={<Store color={searchColors.orange} size={17} strokeWidth={2.4} />}
    >
      <View style={styles.card}>
        {items.map((r, i) => (
          <Row key={r.id} r={r} divided={i > 0} onPick={() => onPick(r)} />
        ))}
      </View>
    </DiscoverSection>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divided: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  pressed: { opacity: 0.7 },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  dim: { opacity: 0.45 },
  letter: { fontFamily: fonts.displayBold, fontSize: 24, color: '#FFFFFF' },
  info: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontFamily: fonts.displayBold, fontSize: 15.5, color: searchColors.ink },
  cuisines: { fontFamily: fonts.ui, fontSize: 12.5, color: searchColors.muted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: fonts.uiMedium, fontSize: 12, color: '#475569' },
  closed: { fontFamily: fonts.uiMedium, fontSize: 12, color: '#DC2626' },
});
