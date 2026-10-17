import { Image } from 'expo-image';
import { ChefHat } from 'lucide-react-native';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { SearchCategory } from '@/lib/search/types';

import { searchColors } from './search-styles';

function countLabel(c: SearchCategory): string | null {
  if (c.itemCount) return `${c.itemCount} dish${c.itemCount === 1 ? '' : 'es'}`;
  if (c.restaurantCount) return `${c.restaurantCount} place${c.restaurantCount === 1 ? '' : 's'}`;
  return null;
}

/** Cuisines / food categories matching the query; tapping one lists every dish for it. */
export function CategoryChips({ items, onPick }: { items: SearchCategory[]; onPick: (c: SearchCategory) => void }) {
  if (!items.length) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Cuisines & categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled">
        {items.map((c) => {
          const count = countLabel(c);
          return (
            <Pressable key={`${c.source}-${c.slug}`} onPress={() => onPick(c)}
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]} accessibilityLabel={`${c.name} dishes`}>
              <View style={styles.icon}>
                {c.imageUrl ? (
                  <Image source={{ uri: c.imageUrl }} style={styles.image} contentFit="cover" />
                ) : (
                  <ChefHat color={searchColors.orange} size={14} strokeWidth={2.2} />
                )}
              </View>
              <Text style={styles.name}>{c.name}</Text>
              {count ? <Text style={styles.count}>{count}</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 14 },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: searchColors.ink,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  row: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
  },
  pressed: { backgroundColor: '#F4F4F5' },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: searchColors.peach,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  name: { fontFamily: fonts.uiMedium, fontSize: 13.5, color: searchColors.ink },
  count: { fontFamily: fonts.ui, fontSize: 12, color: searchColors.muted },
});
