import { Pressable } from '@/components/common/Pressable';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AppState, Linking, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { fonts } from '@/constants/typography';
import { captureGpsPlace } from '@/lib/location/capture-gps-place';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';

const ORANGE = '#F97316';

async function ensureLocationReady(): Promise<'ready' | 'off' | 'denied'> {
  let perm = await Location.getForegroundPermissionsAsync();
  if (perm.status !== 'granted') {
    perm = await Location.requestForegroundPermissionsAsync();
  }
  if (perm.status !== 'granted') return 'denied';

  let servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn && Platform.OS === 'android') {
    try {
      await Location.enableNetworkProviderAsync();
      servicesOn = await Location.hasServicesEnabledAsync();
    } catch {
      servicesOn = false;
    }
  }
  return servicesOn ? 'ready' : 'off';
}

export function LocationEnablePrompt() {
  const gate = useDeliveryLocationStore((s) => s.locationGate);
  const setLocation = useDeliveryLocationStore((s) => s.setLocation);
  const setDetecting = useDeliveryLocationStore((s) => s.setDetecting);
  const dismiss = useDeliveryLocationStore((s) => s.dismissLocationPrompt);
  const setGate = useDeliveryLocationStore((s) => s.setLocationGate);
  const [phase, setPhase] = useState<'ask' | 'locking' | 'done'>('ask');
  const pulse = useSharedValue(0.6);
  const pop = useSharedValue(1);

  const visible = gate !== 'idle';

  useEffect(() => {
    if (!visible) {
      setPhase('ask');
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
      -1,
      true,
    );
  }, [visible, pulse]);

  useEffect(() => {
    if (!visible) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || phase !== 'ask') return;
      void Location.hasServicesEnabledAsync().then(async (on) => {
        const perm = await Location.getForegroundPermissionsAsync();
        if (on && perm.status === 'granted') void lockOn();
      });
    });
    return () => sub.remove();
  }, [visible, phase]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + pulse.value * 0.55 }],
    opacity: 1.15 - pulse.value,
  }));
  const pin = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const lockOn = async () => {
    setPhase('locking');
    setDetecting(true);
    try {
      const status = await ensureLocationReady();
      if (status !== 'ready') {
        setGate(status);
        setPhase('ask');
        if (status === 'denied') await Linking.openSettings();
        return;
      }
      const precise = await captureGpsPlace((quick) => setLocation(quick));
      if (precise) setLocation(precise);
      setPhase('done');
      pop.value = withSequence(
        withTiming(1.18, { duration: 180 }),
        withTiming(1, { duration: 180 }),
      );
      setTimeout(() => setGate('idle'), 700);
    } catch {
      setPhase('ask');
    } finally {
      setDetecting(false);
    }
  };

  const title =
    phase === 'done'
      ? 'Location set'
      : phase === 'locking'
        ? 'Finding you'
        : gate === 'denied'
          ? 'Allow location'
          : 'Turn on location';

  const body =
    phase === 'done'
      ? 'Your delivery address is on the top bar.'
      : phase === 'locking'
        ? 'Locking an accurate pin…'
        : 'We use it once to show where you are, at the top of the app.';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.stage}>
            <Animated.View style={[styles.ring, ring]} />
            <Animated.View style={pin}>
              <MapPin color={ORANGE} size={36} strokeWidth={2.4} />
            </Animated.View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          {phase === 'ask' ? (
            <>
              <Pressable style={styles.primary} onPress={() => void lockOn()}>
                <Text style={styles.primaryText}>
                  {gate === 'denied' ? 'Allow location' : 'Turn on location'}
                </Text>
              </Pressable>
              <Pressable onPress={dismiss} hitSlop={8}>
                <Text style={styles.later}>Not now</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,12,8,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
  },
  stage: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ring: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(249,115,22,0.18)',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: '#1C1917',
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 14,
    lineHeight: 20,
    color: '#78716C',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  primary: {
    alignSelf: 'stretch',
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  later: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: '#A8A29E',
    marginTop: 14,
  },
});
