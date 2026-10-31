import { UtensilsCrossed } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Pressable } from '@/components/common/Pressable';
import { LoadingView } from '@/components/common/StateViews';
import { MenuItemRow } from '@/components/restaurant/MenuItemRow';
import { fonts } from '@/constants/typography';
import type { MenuGroup } from '@/lib/restaurant/use-restaurant-menu-groups';
import type { MenuItem } from '@/lib/restaurant/types';

const INK = '#0B1220';
const MUTED = '#64748B';

export function RestaurantMenuSections(p: {
  rail: ReactNode;
  loading: boolean;
  groups: MenuGroup[];
  filtered: boolean;
  fadeStyle: object;
  unavailable: Set<string>;
  highlightedItemId: string | null;
  onSectionLayout: (catId: string) => (e: LayoutChangeEvent) => void;
  onOpenItem: (item: MenuItem) => void;
  onClearFilter: () => void;
}) {
  return (
    <View style={styles.card}>
      {p.rail}
      {p.loading ? (
        <LoadingView label="Loading menu…" />
      ) : p.groups.length === 0 ? (
        <View style={styles.empty}>
          <UtensilsCrossed color={MUTED} size={28} />
          <Text style={styles.emptyTitle}>{p.filtered ? 'No dishes for this filter' : 'No dishes found'}</Text>
          <Text style={styles.emptySub}>
            {p.filtered
              ? 'Try another filter, or clear filters to see the full menu.'
              : 'This restaurant has not added menu items yet.'}
          </Text>
          {p.filtered ? (
            <Pressable style={styles.clearBtn} onPress={p.onClearFilter}>
              <Text style={styles.clearBtnText}>Clear filters</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Animated.View style={p.fadeStyle}>
          {p.groups.map((cat) => (
            <View key={cat.id} onLayout={p.onSectionLayout(cat.id)} style={styles.block}>
              <View style={styles.head}>
                <Text style={styles.title}>{cat.name}</Text>
                <Text style={styles.sub}>
                  {cat.items.length} dish{cat.items.length === 1 ? '' : 'es'}
                </Text>
              </View>
              <View style={styles.list}>
                {cat.items.map((item, i) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onPress={() => p.onOpenItem(item)}
                    onAdd={() => p.onOpenItem(item)}
                    unavailable={p.unavailable.has(item.id)}
                    highlighted={p.highlightedItemId === String(item.id)}
                    showDivider={i < cat.items.length - 1}
                  />
                ))}
              </View>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1,
    borderColor: '#E8EDF3', overflow: 'hidden', shadowColor: INK, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, paddingBottom: 8,
  },
  list: {
    marginHorizontal: 12, marginTop: 4, backgroundColor: '#FAFBFC', borderRadius: 14,
    paddingHorizontal: 8, borderWidth: 1, borderColor: '#F1F5F9',
  },
  block: { marginTop: 20, paddingHorizontal: 4 },
  head: { paddingHorizontal: 16, marginBottom: 8 },
  title: { fontFamily: fonts.displayBold, fontSize: 18, color: INK, letterSpacing: -0.2 },
  sub: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 12, color: MUTED },
  empty: {
    marginHorizontal: 16, marginTop: 24, padding: 28, borderRadius: 18, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 8,
  },
  emptyTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: INK },
  emptySub: { fontFamily: fonts.ui, fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 18 },
  clearBtn: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: '#F97316' },
  clearBtnText: { fontFamily: fonts.uiBold, fontSize: 13, color: '#FFFFFF' },
});
