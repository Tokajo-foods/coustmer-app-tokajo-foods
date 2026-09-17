import { Image } from 'expo-image';
import { LayoutGrid } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import {
  CATEGORY_ALL_ICON,
  CATEGORY_MORE_ICON,
  localCategoryIcon,
} from '@/components/home/tokajo/assets';
import { fonts } from '@/constants/typography';

const ORANGE = '#F97316';

export type TokajoCategory = {
  id: string;
  label: string;
  slug: string;
  imageUrl?: string;
};

/** Prefer a local design icon; else the API image; else the fallback icon. */
function iconFor(cat: TokajoCategory) {
  const local = localCategoryIcon(cat.slug || cat.label);
  if (local) return local;
  if (cat.imageUrl) return { uri: cat.imageUrl };
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

/** Circular category rail: All · <API categories> · More. */
export function TokajoCategoryStrip({
  categories,
  activeSlug,
  onSelectAll,
  onSelect,
  onMore,
  loading,
}: Props) {
  const preview = categories.slice(0, 6);
  const allActive = activeSlug === 'all' || activeSlug === 'popular';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable style={styles.item} onPress={onSelectAll}>
        <View style={[styles.circle, allActive && styles.circleActive]}>
          {allActive ? (
            <LayoutGrid color="#FFFFFF" size={24} strokeWidth={2.4} />
          ) : (
            <Image
              source={CATEGORY_ALL_ICON}
              style={styles.icon}
              contentFit="cover"
            />
          )}
        </View>
        <Text style={[styles.label, allActive && styles.labelActive]}>
          All
        </Text>
      </Pressable>

      {loading && preview.length === 0
        ? Array.from({ length: 5 }).map((_, i) => (
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
                onPress={() => onSelect(cat)}
              >
                <View
                  style={[styles.circle, active && styles.circleActive]}
                >
                  <Image
                    source={iconFor(cat)}
                    style={styles.icon}
                    contentFit="cover"
                  />
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
        <View style={styles.circle}>
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
    paddingBottom: 6,
    gap: 14,
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
  },
  circleActive: {
    backgroundColor: ORANGE,
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
