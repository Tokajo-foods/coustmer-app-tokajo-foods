import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';
import type { CuisineChip } from '@/lib/restaurant/types';

import { searchColors } from '../search-styles';
import { DiscoverSection } from './DiscoverSection';

const TINTS = ['#FFF1E6', '#FEF3C7', '#ECFDF5', '#EFF6FF', '#FDF2F8', '#F5F3FF'];

/** Cuisines that restaurants inside the delivery radius actually serve. */
export function CravingRail({ items, onPick }: { items: CuisineChip[]; onPick: (name: string) => void }) {
  if (!items.length) return null;
  return (
    <DiscoverSection title="What are you craving?" subtitle="Cuisines from kitchens that deliver to you" flush>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(c) => c.id || c.slug}
        {...PREMIUM_HORIZONTAL_LIST}
        contentContainerStyle={styles.rail}
        renderItem={({ item, index }) => (
          <Pressable
            style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
            onPress={() => onPick(item.name)}
            accessibilityLabel={`Search ${item.name}`}
          >
            <View style={[styles.disc, { backgroundColor: TINTS[index % TINTS.length] }]}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" transition={180} />
              ) : (
                <Text style={styles.letter}>{item.name.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.label} numberOfLines={1}>{item.name}</Text>
          </Pressable>
        )}
      />
    </DiscoverSection>
  );
}

const styles = StyleSheet.create({
  rail: { paddingHorizontal: 16, gap: 14 },
  cell: { width: 72, alignItems: 'center', gap: 8 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  disc: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  letter: { fontFamily: fonts.displayBold, fontSize: 24, color: searchColors.orange },
  label: { fontFamily: fonts.uiMedium, fontSize: 12.5, color: searchColors.ink, textAlign: 'center' },
});
