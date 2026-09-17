import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export type SectionTone = 'plain' | 'peach' | 'cream' | 'mint' | 'ink';

const TONE_BG: Record<SectionTone, string> = {
  plain: 'transparent',
  peach: '#FFF4E8',
  cream: '#FFFBF5',
  mint: '#F1FAF4',
  ink: '#1C1917',
};

type Props = {
  tone?: SectionTone;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Colored section band so rails feel distinct while scrolling. */
export function TokajoSectionBand({
  tone = 'plain',
  children,
  style,
}: Props) {
  const dark = tone === 'ink';
  return (
    <View
      style={[
        styles.band,
        { backgroundColor: TONE_BG[tone] },
        dark && styles.bandInk,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    paddingTop: 18,
    paddingBottom: 20,
    marginBottom: 6,
  },
  bandInk: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
});
