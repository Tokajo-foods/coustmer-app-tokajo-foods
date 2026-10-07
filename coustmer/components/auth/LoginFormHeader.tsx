import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';

type Props = {
  title: string;
  subtitle: string;
};

export function LoginFormHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: authTheme.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: authTheme.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
});
