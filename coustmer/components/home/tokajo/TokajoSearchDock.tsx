import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

const ORANGE = '#F97316';

const HINTS = [
  'Search for restaurants, dishes, cuisines...',
  'Search for “biryani”',
  'Search for “pizza”',
  'Search for “burger”',
];

/** Full-width rounded search field. */
export function TokajoSearchDock() {
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
        <View style={styles.searchIcon}>
          <Search color={ORANGE} size={18} strokeWidth={2.6} />
        </View>
        <Text style={styles.placeholder} numberOfLines={1}>
          {HINTS[i]}
        </Text>
        <View style={styles.divider} />
        <SlidersHorizontal color={ORANGE} size={18} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7DE',
    shadowColor: '#B4541A',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  searchIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 14.5,
    color: '#8A8A8A',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#EFEAE4',
  },
});
