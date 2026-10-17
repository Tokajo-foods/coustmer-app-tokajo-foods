import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Check, Home, MapPin, Percent } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatInr } from '@/lib/format/money';

export type PlacementPhase = 'none' | 'placing' | 'placed';

interface Props {
  phase: PlacementPhase;
  addressLabel: string;
  addressText: string;
  savings: number;
}

const { width } = Dimensions.get('window');

export function OrderPlacementModal({ phase, addressLabel, addressText, savings }: Props) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    if (phase === 'placing') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
      scale.value = 0;
      checkOpacity.value = 0;
    } else if (phase === 'placed') {
      rotation.value = 0; // stop rotation
      scale.value = withSpring(1, { damping: 12, stiffness: 90 });
      checkOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    }
  }, [phase]);

  const animatedSpin = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const animatedScale = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedCheck = useAnimatedStyle(() => {
    return {
      opacity: checkOpacity.value,
      transform: [{ scale: checkOpacity.value }],
    };
  });

  if (phase === 'none') return null;

  return (
    <Modal visible={true} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.container}>
        {phase === 'placed' && savings > 0 && (
          <View style={styles.savingsBanner}>
            <View style={styles.savingsIcon}>
              <Percent color="#FFFFFF" size={12} strokeWidth={3} />
            </View>
            <Text style={styles.savingsText}>{formatInr(savings)} saved on this order</Text>
          </View>
        )}

        <View style={styles.content}>
          {phase === 'placing' ? (
            <View style={styles.mapCircleWrapper}>
              <View style={styles.mapCircleInner}>
                {/* Fake map lines to resemble texture */}
                <View style={styles.mapLine1} />
                <View style={styles.mapLine2} />
                <View style={styles.mapLine3} />
                <View style={styles.mapLine4} />
                <View style={styles.mapLine5} />
                
                {/* Red glow under the pin */}
                <View style={styles.glowEffect} />
                
                {/* Teardrop Pin */}
                <View style={styles.iconPin}>
                  <View style={styles.iconPinInner}>
                    {addressLabel.toLowerCase() === 'home' || addressLabel.toLowerCase() === 'house' ? (
                      <Home color="#FFFFFF" size={24} fill="#FFFFFF" />
                    ) : (
                      <MapPin color="#FFFFFF" size={24} fill="#FFFFFF" />
                    )}
                  </View>
                </View>
                {/* Dot under the pin */}
                <View style={styles.pinDot} />
              </View>
              <Animated.View style={[styles.spinnerBorder, animatedSpin]} />
            </View>
          ) : (
            <Animated.View style={[styles.successCircle, animatedScale]}>
              <Animated.View style={animatedCheck}>
                <Check color="#FFFFFF" size={60} strokeWidth={4} />
              </Animated.View>
            </Animated.View>
          )}

          <Text style={styles.statusText}>
            {phase === 'placing' ? 'Placing order to' : 'Order placed for'}
          </Text>
          
          <Text style={styles.addressLabel}>{addressLabel || 'Home'}</Text>
          <Text style={styles.addressDesc} numberOfLines={2}>
            {addressText}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 40,
  },
  savingsIcon: {
    backgroundColor: '#1BA672',
    padding: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  savingsText: {
    color: '#1BA672',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 100, // offset for visual center
  },
  mapCircleWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  mapCircleInner: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  mapLine1: {
    position: 'absolute',
    width: 4,
    height: 200,
    backgroundColor: '#F3F4F6',
    left: 40,
    transform: [{ rotate: '15deg' }],
  },
  mapLine2: {
    position: 'absolute',
    width: 4,
    height: 200,
    backgroundColor: '#F3F4F6',
    right: 60,
    transform: [{ rotate: '-10deg' }],
  },
  mapLine3: {
    position: 'absolute',
    width: 200,
    height: 4,
    backgroundColor: '#F3F4F6',
    top: 60,
    transform: [{ rotate: '-15deg' }],
  },
  mapLine4: {
    position: 'absolute',
    width: 200,
    height: 6,
    backgroundColor: '#F3F4F6',
    bottom: 50,
  },
  mapLine5: {
    position: 'absolute',
    width: 6,
    height: 100,
    backgroundColor: '#F3F4F6',
    bottom: -10,
    right: 80,
  },
  glowEffect: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(234, 88, 12, 0.4)',
    top: 90,
  },
  spinnerBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 104,
    borderWidth: 6,
    borderColor: '#EA580C',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  iconPin: {
    backgroundColor: '#374151',
    width: 52,
    height: 52,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '45deg' }, { translateY: -12 }, { translateX: -12 }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    position: 'absolute',
    zIndex: 2,
  },
  iconPinInner: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111827',
    position: 'absolute',
    top: 106,
    zIndex: 1,
  },
  successCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1BA672',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  statusText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  addressDesc: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
});
