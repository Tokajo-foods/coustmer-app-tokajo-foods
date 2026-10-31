import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';
import type { CategoryRestaurant } from './category-filters';

type Props = {
  title: string;
  restaurants: CategoryRestaurant[];
  onOpen: (id: string) => void;
};

/** "Restaurants serving X" — round logos that open the outlet at this section. */
export function CategoryRestaurantRail({ title, restaurants, onOpen }: Props) {
  if (!restaurants.length) return null;
  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Restaurants serving {title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {restaurants.map((r) => (
          <Pressable
            key={r.id}
            style={styles.item}
            onPress={() => onOpen(r.id)}
            accessibilityLabel={`${r.name}, ${r.dishCount} matching dishes`}
          >
            <View style={[styles.logo, !r.isOpen && styles.dim]}>
              {r.imageUrl ? (
                <Image source={{ uri: r.imageUrl }} style={styles.logoImg} contentFit="cover" transition={160} />
              ) : (
                <Text style={styles.letter}>{r.name.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.name} numberOfLines={2}>{r.name}</Text>
            <Text style={[styles.meta, !r.isOpen && styles.closed]} numberOfLines={1}>
              {!r.isOpen
                ? 'Closed now'
                : r.distanceKm != null
                  ? `${r.distanceKm} km`
                  : `${r.dishCount} dish${r.dishCount === 1 ? '' : 'es'}`}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const LOGO = 64;

const styles = StyleSheet.create({
  root: { paddingTop: 6, paddingBottom: 8 },
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: searchColors.ink,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  row: { paddingHorizontal: 16, gap: 16 },
  item: { width: 76, alignItems: 'center' },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    backgroundColor: searchColors.peach,
    borderWidth: 1,
    borderColor: '#FDE3CC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: '100%', height: '100%' },
  dim: { opacity: 0.5 },
  letter: { fontFamily: fonts.displayBold, fontSize: 24, color: searchColors.orange },
  name: {
    marginTop: 6,
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    lineHeight: 15,
    color: searchColors.ink,
    textAlign: 'center',
  },
  meta: { marginTop: 2, fontFamily: fonts.ui, fontSize: 11, color: searchColors.muted },
  closed: { color: '#DC2626' },
});
