import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';
import { CATEGORY_FILTERS, type CategoryFilterId } from './category-filters';

type Props = {
  active: CategoryFilterId[];
  onToggle: (id: CategoryFilterId) => void;
};

export function CategoryFilterBar({ active, onToggle }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {CATEGORY_FILTERS.map((f) => {
        const on = active.includes(f.id);
        return (
          <Pressable
            key={f.id}
            onPress={() => onToggle(f.id)}
            style={[styles.chip, on && styles.chipOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            {f.id === 'veg' || f.id === 'nonveg' ? (
              <Text style={[styles.mark, f.id === 'nonveg' && styles.markNon]}>●</Text>
            ) : null}
            <Text style={[styles.label, on && styles.labelOn]}>{f.label}</Text>
            {on ? <Check color={searchColors.orange} size={13} strokeWidth={3} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
  },
  chipOn: { borderColor: searchColors.orange, backgroundColor: searchColors.peach },
  mark: { fontSize: 10, color: '#16A34A' },
  markNon: { color: '#DC2626' },
  label: { fontFamily: fonts.uiSemi, fontSize: 13, color: '#3F3F46' },
  labelOn: { color: '#C2410C' },
});
