import {
  ChevronDown,
  Leaf,
  Star,
  Tag,
  Zap,
} from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';
import type { HomeFilterState } from '@/lib/home/filters';

const ORANGE = '#F97316';

type Props = {
  filters: HomeFilterState;
  onChange: (next: HomeFilterState) => void;
  onMore?: () => void;
};

/** Top Rated · Fast Delivery · Pure Veg · Offers quick chips + filter sheet. */
export function TokajoQuickFilters({ filters, onChange, onMore }: Props) {
  const topRated = filters.sort === 'rating' || filters.ratingBand !== 'any';
  const fast =
    filters.timeBand === 'under_30' || filters.timeBand === 'under_20';
  const pureVeg = filters.pureVeg;
  const offers = filters.offersOnly;

  const chips = [
    {
      key: 'top',
      label: 'Top Rated',
      Icon: Star,
      active: topRated,
      onPress: () =>
        onChange({
          ...filters,
          sort: topRated ? 'relevance' : 'rating',
        }),
    },
    {
      key: 'fast',
      label: 'Fast Delivery',
      Icon: Zap,
      active: fast,
      onPress: () =>
        onChange({ ...filters, timeBand: fast ? 'any' : 'under_30' }),
    },
    {
      key: 'veg',
      label: 'Pure Veg',
      Icon: Leaf,
      active: pureVeg,
      onPress: () => onChange({ ...filters, pureVeg: !pureVeg }),
    },
    {
      key: 'offers',
      label: 'Offers',
      Icon: Tag,
      active: offers,
      onPress: () => onChange({ ...filters, offersOnly: !offers }),
    },
  ] as const;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips.map(({ key, label, Icon, active, onPress }) => (
        <Pressable
          key={key}
          style={[styles.chip, active && styles.chipActive]}
          onPress={onPress}
        >
          <Icon
            color={active ? '#FFFFFF' : ORANGE}
            size={14}
            strokeWidth={2.6}
            fill={active && key === 'top' ? '#FFFFFF' : 'transparent'}
          />
          <Text style={[styles.label, active && styles.labelActive]}>
            {label}
          </Text>
        </Pressable>
      ))}

      <Pressable style={styles.dropBtn} onPress={onMore}>
        <ChevronDown color="#4B4B4B" size={18} strokeWidth={2.6} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: '#3A3A3A',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  dropBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#EDEDED',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
