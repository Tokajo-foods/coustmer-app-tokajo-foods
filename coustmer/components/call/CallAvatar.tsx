import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

type Props = {
  name: string;
  logoUrl?: string | null;
  size?: number;
};

/** Round restaurant logo (or initial) for incoming / active call screens. */
export function CallAvatar({ name, logoUrl, size = 112 }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || 'T';
  const uri = logoUrl?.trim() || '';
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#1F2C34',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    fontFamily: fonts.displayBold,
    color: '#E9EDEF',
  },
});
