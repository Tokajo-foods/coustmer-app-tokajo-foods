import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { fonts } from '@/constants/typography';

const ORANGE = '#F97316';

const HINTS = [
  'Search for restaurants, dishes, cuisines...',
  'Search for “biryani”',
  'Search for “pizza”',
  'Search for “burger”',
];

type Props = {
  onFilterPress?: () => void;
};

/** Rounded search field + square filter button. */
export function TokajoSearchDock({ onFilterPress }: Props) {
  const router = useRouter();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HINTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.search}
        onPress={() => router.push('/search')}
        accessibilityRole="search"
      >
        <Search color="#9A9A9A" size={19} strokeWidth={2.3} />
        <Text style={styles.placeholder} numberOfLines={1}>
          {HINTS[i]}
        </Text>
      </Pressable>

      <SmoothPressable
        style={styles.filterBtn}
        onPress={onFilterPress}
        pressScale={0.94}
        accessibilityLabel="Filters"
      >
        <SlidersHorizontal color={ORANGE} size={20} strokeWidth={2.4} />
      </SmoothPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 14,
    color: '#9A9A9A',
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
