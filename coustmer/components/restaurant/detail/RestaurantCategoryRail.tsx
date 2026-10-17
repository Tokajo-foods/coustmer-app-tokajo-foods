import { Pressable } from '@/components/common/Pressable';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';

const ORANGE = '#F97316';
const INK = '#0B1220';
const MUTED = '#64748B';

export type MenuCategoryChip = {
  id: string;
  name: string;
  count: number;
};

type Props = {
  categories: MenuCategoryChip[];
  activeId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
};

export function RestaurantCategoryRail({
  categories,
  activeId,
  onSelect,
  compact,
}: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <ScrollView
        horizontal
        {...PREMIUM_HORIZONTAL_LIST}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable
          style={styles.item}
          onPress={() => onSelect('popular')}
        >
          <View style={styles.itemInner}>
            <Text
              style={[styles.label, activeId === 'popular' && styles.labelOn]}
            >
              Popular
            </Text>
          </View>
          {activeId === 'popular' ? <View style={styles.indicator} /> : null}
        </Pressable>

        {categories.map((cat) => {
          const on = activeId === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={styles.item}
              onPress={() => onSelect(cat.id)}
            >
              <View style={styles.itemInner}>
                <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
                  {cat.name}
                </Text>
                <View style={[styles.count, on && styles.countOn]}>
                  <Text style={[styles.countText, on && styles.countTextOn]}>
                    {cat.count}
                  </Text>
                </View>
              </View>
              {on ? <View style={styles.indicator} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CBD5E1',
    marginTop: 4,
  },
  wrapCompact: {
    marginTop: 0,
    borderTopWidth: 0,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 0,
    gap: 4,
  },
  item: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
    maxWidth: 160,
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: MUTED,
  },
  labelOn: {
    fontFamily: fonts.uiBold,
    color: INK,
  },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countOn: {
    backgroundColor: '#FFF7ED',
  },
  countText: {
    fontFamily: fonts.uiBold,
    fontSize: 10,
    color: MUTED,
  },
  countTextOn: {
    color: ORANGE,
  },
  indicator: {
    marginTop: 8,
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: ORANGE,
  },
});
