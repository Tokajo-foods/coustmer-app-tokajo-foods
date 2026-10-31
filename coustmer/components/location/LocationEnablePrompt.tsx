import { Pressable } from '@/components/common/Pressable';
import { locationPromptStyles as styles } from '@/components/location/location-enable-prompt-styles';
import * as Location from 'expo-location';
import { Check, MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AppState, Linking, Modal, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { captureGpsPlace } from '@/lib/location/capture-gps-place';
import { ensureLocationReady } from '@/lib/location/ensure-location-ready';
import { restorePreviousDeliveryLocation } from '@/lib/location/restore-previous-location';
import { useAuthStore } from '@/store/auth-store';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';

const CLOSE_AFTER_FOUND_MS = 1400;

export function LocationEnablePrompt() {
  const insets = useSafeAreaInsets();
  const gate = useDeliveryLocationStore((s) => s.locationGate);
  const setLocation = useDeliveryLocationStore((s) => s.setLocation);
  const setDetecting = useDeliveryLocationStore((s) => s.setDetecting);
  const dismiss = useDeliveryLocationStore((s) => s.dismissLocationPrompt);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const setGate = useDeliveryLocationStore((s) => s.setLocationGate);
  const [phase, setPhase] = useState<'ask' | 'locking' | 'done'>('ask');
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<string | null>(null);
  const pulse = useSharedValue(0.72);
  const pop = useSharedValue(1);

  const visible = gate !== 'idle';

  useEffect(() => {
    if (!visible) {
      setPhase('ask');
      setError(null);
      setFound(null);
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
    setError(null);
    setDetecting(true);
    try {
      const status = await ensureLocationReady();
      if (status !== 'ready') {
        setGate(status === 'blocked' ? 'denied' : status);
        setPhase('ask');
        if (status === 'off') setError('Location is off. Turn it on to set your delivery pin.');
        else if (status === 'denied') setError('Allow location so we can find restaurants near you.');
        else {
          setError('Location is blocked for TOKAJO FOODS. Allow it in Settings → Permissions.');
          await Linking.openSettings();
        }
        return;
      }
      const precise = await captureGpsPlace((quick) => setLocation(quick));
      setLocation(precise);
      setFound(precise.formattedAddress || precise.label);
      setPhase('done');
      pop.value = withSequence(
        withTiming(1.12, { duration: 180 }),
        withTiming(1, { duration: 180 }),
      );
      setTimeout(() => setGate('idle'), CLOSE_AFTER_FOUND_MS);
    } catch {
      setPhase('ask');
      setError('Couldn’t get your location. Move near a window or turn on GPS, then try again.');
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
      ? (found ?? 'Your address is on the top bar.')
      : phase === 'locking'
        ? 'Setting your delivery pin.'
        : (error ?? 'Used only to set your delivery address.');

  const buttonLabel = error
    ? 'Try again'
    : gate === 'denied'
      ? 'Allow location'
      : 'Turn on location';

  const onNotNow = () => {
    dismiss();
    void restorePreviousDeliveryLocation(userId).catch(() => undefined);
  };

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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          {phase === 'ask' ? (
            <>
              <Pressable style={styles.primary} onPress={() => void lockOn()}>
                <Text style={styles.primaryText}>{buttonLabel}</Text>
              </Pressable>
              <Pressable style={styles.later} onPress={onNotNow} hitSlop={8}>
                <Text style={styles.laterText}>Not now</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
