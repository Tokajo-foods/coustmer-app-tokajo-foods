import { Pressable } from '@/components/common/Pressable';
import { Leaf, Search, X } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { PREMIUM_HORIZONTAL_LIST } from '@/lib/motion/premium';

const ORANGE = '#F97316';
const INK = '#0B1220';
const MUTED = '#64748B';

export type MenuFilterId = 'all' | 'veg' | 'non_veg' | 'bestsellers' | 'recommended';

const FILTER_CHIPS: Array<{ id: MenuFilterId; label: string; vegIcon?: boolean }> = [
  { id: 'all', label: 'All' },
  { id: 'veg', label: 'Veg', vegIcon: true },
  { id: 'non_veg', label: 'Non-veg' },
  { id: 'bestsellers', label: 'Bestsellers' },
  { id: 'recommended', label: "Chef's pick" },
];

type Props = {
  query: string;
  onQueryChange: (text: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  menuFilter: MenuFilterId;
  onMenuFilter: (id: MenuFilterId) => void;
  vegOnly: boolean;
  restaurantName?: string;
};

export function RestaurantMenuSearchBar({
  query,
  onQueryChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  menuFilter,
  onMenuFilter,
  vegOnly,
  restaurantName,
}: Props) {
  const scope = restaurantName?.trim() || 'this restaurant';
  const placeholder =
    menuFilter === 'veg' || vegOnly
      ? `Search veg dishes at ${scope}…`
      : `Search ${scope} menu…`;

  return (
    <View style={styles.card}>
      <View style={styles.searchRow}>
        <Search color={MUTED} size={18} strokeWidth={2.2} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={onQueryChange}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
          blurOnSubmit={false}
        />
        {query ? (
          <Pressable onPress={onClearSearch} hitSlop={8} style={styles.clearBtn}>
            <X color={MUTED} size={16} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.divider} />

      <ScrollView
        horizontal
        {...PREMIUM_HORIZONTAL_LIST}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_CHIPS.map((chip) => {
          const on = menuFilter === chip.id;
          return (
            <Pressable
              key={chip.id}
              style={[styles.filterChip, on && styles.filterChipOn]}
              onPress={() => onMenuFilter(chip.id)}
            >
              {chip.vegIcon ? (
                <Leaf color={on ? '#FFF' : '#15803D'} size={12} strokeWidth={2.4} />
              ) : null}
              <Text style={[styles.filterChipText, on && styles.filterChipTextOn]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: INK,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8EDF3',
    marginHorizontal: 14,
  },
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipOn: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  filterChipText: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: '#475569',
  },
  filterChipTextOn: {
    fontFamily: fonts.uiBold,
    color: '#FFFFFF',
  },
});
