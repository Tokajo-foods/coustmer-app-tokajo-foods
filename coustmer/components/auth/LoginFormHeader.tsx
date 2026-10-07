import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';

type Props = {
  title: string;
  subtitle: string;
};

const LOGO = require('../../public/tokajo-logo.webp');

export function LoginFormHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brandRow}>
        <View style={styles.logoRing}>
          <Image source={LOGO} style={styles.logo} contentFit="contain" />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brandName}>Tokajo</Text>
          <Text style={styles.brandTag}>FOODS</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: authTheme.brandSoft,
    borderWidth: 1,
    borderColor: authTheme.brandMuted,
  },
  logoRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 34,
    height: 34,
  },
  brandText: {
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: authTheme.brandDark,
    letterSpacing: -0.2,
  },
  brandTag: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: authTheme.brand,
    letterSpacing: 2.4,
    marginTop: 1,
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
