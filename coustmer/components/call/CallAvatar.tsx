import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

type Props = {
  name: string;
  logoUrl?: string | null;
  size?: number;
  pulsing?: boolean;
};

/** Round restaurant logo (or initial) for incoming / active call screens. */
export function CallAvatar({ name, logoUrl, size = 112, pulsing = false }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const initial = name.trim().charAt(0).toUpperCase() || 'T';
  const uri = logoUrl?.trim() || '';

  useEffect(() => {
    if (!pulsing) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, pulsing]);

  const ring = {
    width: size,
    height: size,
    borderRadius: size / 2,
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
  };

  return (
    <View style={{ width: size * 1.7, height: size * 1.7, alignItems: 'center', justifyContent: 'center' }}>
      {pulsing ? <Animated.View style={[styles.ring, ring]} /> : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', backgroundColor: '#25D366' },
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
