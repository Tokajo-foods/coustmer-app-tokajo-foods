import { Pressable } from '@/components/common/Pressable';
import { locationPromptStyles as styles } from '@/components/location/location-enable-prompt-styles';
import * as Location from 'expo-location';
import { Check, MapPin, Navigation, Store } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AppState, Linking, Modal, Platform, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authTheme } from '@/constants/auth-theme';
import { captureGpsPlace } from '@/lib/location/capture-gps-place';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';

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

const POINTS = [
  { icon: Navigation, label: 'Drops your address on the top bar' },
  { icon: Store, label: 'Shows restaurants that can deliver to you' },
  { icon: MapPin, label: 'Uses a precise pin, not a city guess' },
] as const;

export function LocationEnablePrompt() {
  const insets = useSafeAreaInsets();
  const gate = useDeliveryLocationStore((s) => s.locationGate);
  const setLocation = useDeliveryLocationStore((s) => s.setLocation);
  const setDetecting = useDeliveryLocationStore((s) => s.setDetecting);
  const dismiss = useDeliveryLocationStore((s) => s.dismissLocationPrompt);
  const setGate = useDeliveryLocationStore((s) => s.setLocationGate);
  const [phase, setPhase] = useState<'ask' | 'locking' | 'done'>('ask');
  const pulse = useSharedValue(0.72);
  const pop = useSharedValue(1);

  const visible = gate !== 'idle';

  useEffect(() => {
    if (!visible) {
      setPhase('ask');
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }),
      -1,
      true,
    );
  }, [visible, pulse]);

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
        withTiming(1.12, { duration: 180 }),
        withTiming(1, { duration: 180 }),
      );
      setTimeout(() => setGate('idle'), 800);
    } catch {
      setPhase('ask');
    } finally {
      setDetecting(false);
    }
  };

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
    transform: [{ scale: 0.86 + pulse.value * 0.22 }],
    opacity: 0.35 + (1 - pulse.value) * 0.45,
  }));
  const pin = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const title =
    phase === 'done'
      ? 'You are set'
      : phase === 'locking'
        ? 'Finding your spot'
        : gate === 'denied'
          ? 'Allow location'
          : 'Turn on location';

  const body =
    phase === 'done'
      ? 'Your address is now on the top of the home screen.'
      : phase === 'locking'
        ? 'Hold on — we are locking an accurate pin.'
        : 'Location is off. Turn it on so we can show where you are.';

  const buttonLabel = gate === 'denied' ? 'Allow location' : 'Turn on location';

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <View style={styles.stage}>
            <View style={styles.halo} />
            <Animated.View style={[styles.ring, ring]} />
            <Animated.View style={[styles.pinBadge, pin]}>
              {phase === 'done' ? (
                <Check color="#FFFFFF" size={30} strokeWidth={2.6} />
              ) : (
                <MapPin color="#FFFFFF" size={30} strokeWidth={2.3} />
              )}
            </Animated.View>
          </View>
          <Text style={styles.eyebrow}>DELIVERY PIN</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          {phase === 'ask' ? (
            <View style={styles.points}>
              {POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <View key={point.label} style={styles.point}>
                    <View style={styles.pointIcon}>
                      <Icon color={authTheme.brand} size={16} strokeWidth={2.3} />
                    </View>
                    <Text style={styles.pointText}>{point.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {phase === 'ask' ? (
            <>
              <Pressable style={styles.primary} onPress={() => void lockOn()}>
                <Text style={styles.primaryText}>{buttonLabel}</Text>
              </Pressable>
              <Pressable style={styles.later} onPress={dismiss} hitSlop={8}>
                <Text style={styles.laterText}>Not now</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
