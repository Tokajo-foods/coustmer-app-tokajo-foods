import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutUp, useReducedMotion } from 'react-native-reanimated';

import { fonts } from '@/constants/typography';

import { SEARCH_PROMPT, SEARCH_SCOPES, searchColors } from './search-styles';

const HOLD_MS = 2200;
const enter = FadeInDown.duration(320).easing(Easing.out(Easing.cubic));
const exit = FadeOutUp.duration(260).easing(Easing.in(Easing.cubic));

/** "Search for <word>" where the word cycles through what can be searched. */
export function RotatingPlaceholder() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SEARCH_SCOPES.length), HOLD_MS);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <View pointerEvents="none" style={styles.row}>
      <Text style={styles.prompt}>{SEARCH_PROMPT} </Text>
      <View style={styles.slot}>
        <Animated.Text key={index} entering={enter} exiting={exit} style={styles.word} numberOfLines={1}>
          {`"${SEARCH_SCOPES[index]}"`}
        </Animated.Text>
      </View>
    </View>
  );
}

/** The first frame of the rotator, for the morph ghost to land on. */
export function StaticPlaceholder() {
  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{SEARCH_PROMPT} </Text>
      <Text style={styles.word} numberOfLines={1}>{`"${SEARCH_SCOPES[0]}"`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  prompt: { fontFamily: fonts.ui, fontSize: 15, color: searchColors.muted },
  slot: { flex: 1, height: 22, justifyContent: 'center', overflow: 'hidden' },
  word: { fontFamily: fonts.uiBold, fontSize: 15, color: searchColors.ink },
});
