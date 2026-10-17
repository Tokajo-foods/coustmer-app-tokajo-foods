import { History, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';
import { DiscoverSection } from './DiscoverSection';

/** Recent searches as compact chips. Long-press or ✕ removes one. */
export function RecentChips({
  terms,
  onPick,
  onRemove,
  onClear,
}: {
  terms: string[];
  onPick: (term: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
}) {
  if (!terms.length) return null;
  return (
    <DiscoverSection
      title="Recent searches"
      icon={<History color={searchColors.orange} size={17} strokeWidth={2.4} />}
      action="Clear"
      onAction={onClear}
    >
      <View style={styles.wrap}>
        {terms.slice(0, 8).map((term) => (
          <Pressable
            key={term}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            onPress={() => onPick(term)}
            onLongPress={() => onRemove(term)}
            accessibilityLabel={`Search ${term}`}
          >
            <History color={searchColors.muted} size={13} strokeWidth={2.2} />
            <Text style={styles.text} numberOfLines={1}>{term}</Text>
            <Pressable onPress={() => onRemove(term)} hitSlop={8} accessibilityLabel={`Remove ${term}`}>
              <X color="#94A3B8" size={12} strokeWidth={2.4} />
            </Pressable>
          </Pressable>
        ))}
      </View>
    </DiscoverSection>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    paddingLeft: 10,
    paddingRight: 10,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  pressed: { backgroundColor: '#F1F5F9' },
  text: { fontFamily: fonts.uiMedium, fontSize: 13, color: searchColors.ink, maxWidth: 180 },
});
