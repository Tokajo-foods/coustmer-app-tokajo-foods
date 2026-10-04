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
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';
import { hapticSelection } from '@/lib/utils/haptics';

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
      {...PREMIUM_HORIZONTAL_LIST}
      contentContainerStyle={styles.row}
    >
      {chips.map(({ key, label, Icon, active, onPress }) => (
        <Pressable
          key={key}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => {
            hapticSelection();
            onPress();
          }}
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
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#EFE7DF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#B4541A',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  chipActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE7DF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B4541A',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
