import { Image } from 'expo-image';
import { LayoutGrid } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import {
  CATEGORY_PREVIEW_COUNT,
  CIRCLE_CATEGORIES,
  type CircleCategory,
} from '@/components/home/tokajo/circle-categories';
import { fonts } from '@/constants/typography';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';

const ORANGE = '#F97316';
const CIRCLE = 64;

export type TokajoCategory = {
  id: string;
  label: string;
  slug: string;
  imageUrl?: string;
};

type Props = {
  categories: TokajoCategory[];
  activeSlug: string;
  onSelectAll: () => void;
  onSelect: (cat: TokajoCategory) => void;
  onMore: () => void;
  loading?: boolean;
};

function CategoryTile({
  cat,
  active,
  inGrid,
  onPress,
}: {
  cat: CircleCategory;
  active: boolean;
  inGrid?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.item, inGrid && styles.itemGrid]} onPress={onPress}>
      <View style={styles.circle}>
        <Image
          source={cat.image}
          style={[styles.photo, cat.slug === 'rolls' && styles.photoRolls]}
          contentFit="cover"
          transition={120}
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
}

/** Circular food categories. Eight across, More expands the rest in place. */
export function TokajoCategoryStrip({
  activeSlug,
  onSelectAll,
  onSelect,
  loading,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? CIRCLE_CATEGORIES
    : CIRCLE_CATEGORIES.slice(0, CATEGORY_PREVIEW_COUNT);

  const open = (cat: CircleCategory) => {
    if (activeSlug === cat.slug) {
      onSelectAll();
      return;
    }
    onSelect({ id: cat.id, label: cat.label, slug: cat.slug });
  };

  const more = (
    <Pressable
      style={[styles.item, expanded && styles.itemGrid]}
      onPress={() => setExpanded((v) => !v)}
    >
      <View style={[styles.circle, styles.moreCircle]}>
        <LayoutGrid color={ORANGE} size={26} strokeWidth={2.2} />
      </View>
      <Text style={styles.label}>{expanded ? 'Less' : 'More'}</Text>
    </Pressable>
  );

  if (loading && CIRCLE_CATEGORIES.length === 0) {
    return (
      <View style={styles.row}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`sk-${i}`} style={styles.item}>
            <View style={[styles.circle, styles.circleSkeleton]} />
            <View style={styles.labelSkeleton} />
          </View>
        ))}
      </View>
    );
  }

  if (expanded) {
    return (
      <ScrollView
        style={styles.expandedScroll}
        contentContainerStyle={styles.grid}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        {visible.map((cat) => (
          <CategoryTile
            key={cat.id}
            cat={cat}
            inGrid
            active={activeSlug === cat.slug}
            onPress={() => open(cat)}
          />
        ))}
        {more}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      horizontal
      {...PREMIUM_HORIZONTAL_LIST}
      contentContainerStyle={styles.row}
    >
      {visible.map((cat) => (
        <CategoryTile
          key={cat.id}
          cat={cat}
          active={activeSlug === cat.slug}
          onPress={() => open(cat)}
        />
      ))}
      {more}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 14,
  },
  expandedScroll: {
    maxHeight: 340,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 8,
    rowGap: 14,
  },
  item: {
    width: 76,
    alignItems: 'center',
    gap: 6,
  },
  itemGrid: {
    width: '25%',
    marginBottom: 4,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE4D1',
    shadowColor: '#B4541A',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  moreCircle: {
    backgroundColor: '#FFF3EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSkeleton: {
    backgroundColor: '#F0F0F0',
  },
  photo: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 2.75 }, { translateY: 0 }, { translateX: 0.5 }],
  },
  photoRolls: {
    transform: [{ scale: 2.75 }, { translateY: -(CIRCLE * 0.02) }, { translateX: 0.5 }],
  },
  label: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: '#3A3A3A',
    textAlign: 'center',
  },
  labelActive: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
  },
  labelSkeleton: {
    width: 40,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
  },
});
