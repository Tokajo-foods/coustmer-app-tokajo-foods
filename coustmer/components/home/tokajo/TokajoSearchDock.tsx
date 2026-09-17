import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

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
        <Search color="#9A9A9A" size={20} strokeWidth={2.3} />
        <Text style={styles.placeholder} numberOfLines={1}>
          {HINTS[i]}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 14.5,
    color: '#9A9A9A',
  },
});
