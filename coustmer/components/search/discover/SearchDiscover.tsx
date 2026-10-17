import { Search } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { fonts } from '@/constants/typography';
import { PREMIUM_SCROLL } from '@/lib/motion/premium';

import { searchColors } from '../search-styles';
import { RecentChips } from './RecentChips';

type Props = {
  recent: string[];
  onSearch: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
};

/** Search landing before typing: recent searches, or a quiet prompt when there are none. */
export function SearchDiscover({ recent, onSearch, onRemoveRecent, onClearRecent }: Props) {
  return (
    <ScrollView {...PREMIUM_SCROLL} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {recent.length ? (
        <RecentChips terms={recent} onPick={onSearch} onRemove={onRemoveRecent} onClear={onClearRecent} />
      ) : (
        <Animated.View entering={FadeIn.duration(260)} style={styles.idle}>
          <View style={styles.idleIcon}>
            <Search color={searchColors.orange} size={22} strokeWidth={2.4} />
          </View>
          <Text style={styles.idleTitle}>Search dishes, cuisines and restaurants</Text>
          <Text style={styles.idleBody}>Results come from restaurants that deliver to you.</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 120 },
  idle: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 72, gap: 6 },
  idleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: searchColors.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  idleTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: searchColors.ink, textAlign: 'center' },
  idleBody: { fontFamily: fonts.ui, fontSize: 13, color: searchColors.muted, textAlign: 'center', lineHeight: 19 },
});
