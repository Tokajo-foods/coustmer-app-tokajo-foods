import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

type Props = {
  title: string;
  subtitle: string;
  /** Tighter header for compact sheets (e.g. signup phone step). */
  compact?: boolean;
};

export function LoginFormHeader({ title, subtitle, compact }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 6,
  },
  wrapCompact: {
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: authTheme.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: authTheme.textMuted,
    marginBottom: 14,
    lineHeight: 20,
  },
  subtitleCompact: {
    marginBottom: 8,
    lineHeight: 19,
  },
});
