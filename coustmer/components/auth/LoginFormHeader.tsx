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
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: authTheme.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: authTheme.textMuted,
    marginBottom: 18,
    lineHeight: 20,
  },
});
