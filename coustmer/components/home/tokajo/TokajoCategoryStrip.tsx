import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import {
  CATEGORY_MORE_ICON,
  localCategoryIcon,
} from '@/components/home/tokajo/assets';
import { fonts } from '@/constants/typography';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';

const ORANGE = '#F97316';

export type TokajoCategory = {
  id: string;
  label: string;
  slug: string;
  imageUrl?: string;
};

/**
 * Prefer the API's per-category photo (matches the name like Swiggy/Zomato);
 * fall back to shipped artwork, then the generic icon.
 */
function iconFor(cat: TokajoCategory) {
  if (cat.imageUrl) return { uri: cat.imageUrl };
  const local = localCategoryIcon(cat.slug || cat.label);
  if (local) return local;
  return CATEGORY_MORE_ICON;
}

type Props = {
  categories: TokajoCategory[];
  activeSlug: string;
  onSelectAll: () => void;
  onSelect: (cat: TokajoCategory) => void;
  onMore: () => void;
  loading?: boolean;
};

/** Circular category rail: <API categories with per-name photos> · More. */
export function TokajoCategoryStrip({
  categories,
  activeSlug,
  onSelectAll,
  onSelect,
  onMore,
  loading,
}: Props) {
  const preview = categories.slice(0, 8);

  return (
    <ScrollView
      horizontal
      {...PREMIUM_HORIZONTAL_LIST}
      contentContainerStyle={styles.row}
    >
      {loading && preview.length === 0
        ? Array.from({ length: 6 }).map((_, i) => (
            <View key={`sk-${i}`} style={styles.item}>
              <View style={[styles.circle, styles.circleSkeleton]} />
              <View style={styles.labelSkeleton} />
            </View>
          ))
        : preview.map((cat) => {
            const active = activeSlug === cat.slug;
            return (
              <Pressable
                key={cat.id}
                style={styles.item}
                onPress={() => (active ? onSelectAll() : onSelect(cat))}
              >
                <View style={[styles.circle, active && styles.circleActive]}>
                  <Image
                    source={iconFor(cat)}
                    style={styles.icon}
                    contentFit="cover"
                    transition={120}
                  />
                  {active ? <View style={styles.activeRing} /> : null}
                </View>
                <Text
                  style={[styles.label, active && styles.labelActive]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}

      <Pressable style={styles.item} onPress={onMore}>
        <View style={[styles.circle, styles.moreCircle]}>
          <Image
            source={CATEGORY_MORE_ICON}
            style={styles.icon}
            contentFit="cover"
          />
        </View>
        <Text style={styles.label}>More</Text>
      </Pressable>
    </ScrollView>
  );
}

const CIRCLE = 58;

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 16,
  },
  item: {
    width: 62,
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: '#FFF3EA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFE4D1',
    shadowColor: '#B4541A',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  circleActive: {
    borderColor: ORANGE,
  },
  activeRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCLE / 2,
    borderWidth: 2.5,
    borderColor: ORANGE,
  },
  moreCircle: {
    backgroundColor: '#FFF3EA',
  },
  circleSkeleton: {
    backgroundColor: '#F0F0F0',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: '#4B4B4B',
    textAlign: 'center',
  },
  labelActive: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
  },
  labelSkeleton: {
    width: 36,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
  },
});
