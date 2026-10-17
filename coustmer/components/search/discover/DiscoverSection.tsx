import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';

/** Titled block on the search landing page. */
export function DiscoverSection({
  title,
  subtitle,
  action,
  onAction,
  children,
  flush,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  /** Children scroll edge to edge (horizontal rails). */
  flush?: boolean;
}) {
  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action && onAction ? (
          <Pressable onPress={onAction} hitSlop={10}>
            <Text style={styles.action}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={flush ? undefined : styles.inset}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: { paddingTop: 22 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titles: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.displayBold, fontSize: 17, color: searchColors.ink, letterSpacing: -0.2 },
  subtitle: { fontFamily: fonts.ui, fontSize: 12.5, color: searchColors.muted },
  action: { fontFamily: fonts.uiSemi, fontSize: 13, color: searchColors.orange },
  inset: { paddingHorizontal: 16 },
});
