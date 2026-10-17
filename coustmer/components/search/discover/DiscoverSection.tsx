import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';

/** Titled block on the search landing page. */
export function DiscoverSection({
  title,
  subtitle,
  icon,
  action,
  onAction,
  children,
  flush,
}: {
  title: string;
  subtitle?: string;
  /** Small glyph shown in an orange badge before the title. */
  icon?: ReactNode;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  /** Children scroll edge to edge (horizontal rails). */
  flush?: boolean;
}) {
  return (
    <Animated.View entering={FadeIn.duration(260)} style={styles.section}>
      <View style={styles.header}>
        {icon ? <View style={styles.badge}>{icon}</View> : null}
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action && onAction ? (
          <Pressable onPress={onAction} hitSlop={10} style={styles.actionBtn}>
            <Text style={styles.action}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={flush ? undefined : styles.inset}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: { paddingTop: 26 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: searchColors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1, gap: 1 },
  title: { fontFamily: fonts.displayBold, fontSize: 17.5, color: searchColors.ink, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.ui, fontSize: 12.5, color: searchColors.muted },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: searchColors.peach },
  action: { fontFamily: fonts.uiBold, fontSize: 12, color: searchColors.orange },
  inset: { paddingHorizontal: 16 },
});
