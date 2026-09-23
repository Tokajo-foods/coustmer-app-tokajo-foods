import { StyleSheet, Text, View } from 'react-native';
import { MapPinOff } from 'lucide-react-native';

import { fonts } from '@/constants/typography';
import {
  GOOGLE_MAPS_LOAD_FAILED_MESSAGE,
  GOOGLE_MAPS_MISSING_KEY_MESSAGE,
  isGoogleMapsConfigured,
} from '@/lib/google-maps';

type Props = {
  /** Extra detail from WebView / Places error when available. */
  detail?: string | null;
};

/** Full-bleed Google Maps failure — never shows another map provider. */
export function GoogleMapsErrorView({ detail }: Props) {
  const title = isGoogleMapsConfigured()
    ? 'Google Maps unavailable'
    : 'Google Maps key required';
  const body =
    detail?.trim() ||
    (isGoogleMapsConfigured()
      ? GOOGLE_MAPS_LOAD_FAILED_MESSAGE
      : GOOGLE_MAPS_MISSING_KEY_MESSAGE);

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <MapPinOff color="#EA580C" size={28} strokeWidth={2.2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#FFF7ED',
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#9A3412',
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#C2410C',
    textAlign: 'center',
  },
});
