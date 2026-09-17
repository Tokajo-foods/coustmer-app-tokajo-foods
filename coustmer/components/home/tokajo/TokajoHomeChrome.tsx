import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HomeFilterSheet } from '@/components/home/HomeFilterSheet';
import { TokajoCategoryStrip } from '@/components/home/tokajo/TokajoCategoryStrip';
import type { TokajoCategory } from '@/components/home/tokajo/TokajoCategoryStrip';
import { TokajoHeroBanner } from '@/components/home/tokajo/TokajoHeroBanner';
import { TokajoQuickFilters } from '@/components/home/tokajo/TokajoQuickFilters';
import { TokajoSearchDock } from '@/components/home/tokajo/TokajoSearchDock';
import { TokajoTopBar } from '@/components/home/tokajo/TokajoTopBar';
import type { HomeBanner } from '@/lib/customer/types';
import type { HomeFilterState } from '@/lib/home/filters';
import type { Restaurant } from '@/lib/restaurant/types';

type Props = {
  topInset?: number;
  deliveryTitle: string;
  deliverySubtitle?: string;
  isDetectingLocation?: boolean;
  onLocationPress?: () => void;
  banners?: HomeBanner[] | null;
  filters: HomeFilterState;
  onFiltersChange: (next: HomeFilterState) => void;
  categories: TokajoCategory[];
  categoriesLoading?: boolean;
  restaurants?: Restaurant[];
};

/** TOKAJO home header: location · logo · bell · search · categories · hero · chips. */
export function TokajoHomeChrome({
  topInset = 0,
  deliveryTitle,
  deliverySubtitle,
  isDetectingLocation,
  onLocationPress,
  banners,
  filters,
  onFiltersChange,
  categories,
  categoriesLoading,
  restaurants = [],
}: Props) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  const openCategory = (cat: TokajoCategory) => {
    onFiltersChange({ ...filters, cuisine: cat.slug });
    router.push({
      pathname: '/restaurants',
      params: { cuisine: cat.slug, label: cat.label },
    });
  };

  return (
    <View style={[styles.root, { paddingTop: topInset + 8 }]}>
      <TokajoTopBar
        deliveryTitle={deliveryTitle}
        deliverySubtitle={deliverySubtitle}
        isDetectingLocation={isDetectingLocation}
        onLocationPress={onLocationPress}
      />

      <TokajoSearchDock />

      <TokajoCategoryStrip
        categories={categories}
        activeSlug={filters.cuisine}
        loading={categoriesLoading}
        onSelectAll={() => onFiltersChange({ ...filters, cuisine: 'popular' })}
        onSelect={openCategory}
        onMore={() => router.push('/restaurants')}
      />

      <View style={styles.heroSpacer} />

      <TokajoHeroBanner banners={banners} />

      <TokajoQuickFilters
        filters={filters}
        onChange={onFiltersChange}
        onMore={() => setSheetOpen(true)}
      />

      <HomeFilterSheet
        visible={sheetOpen}
        filters={filters}
        restaurants={restaurants}
        initialTab="sort"
        onClose={() => setSheetOpen(false)}
        onApply={onFiltersChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#FFFFFF',
  },
  heroSpacer: {
    height: 20,
  },
});
