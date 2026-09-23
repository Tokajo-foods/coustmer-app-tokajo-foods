import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function safe(run: () => Promise<unknown>) {
  if (Platform.OS === 'web') return;
  try {
    await run();
  } catch {
    // ignore — haptics unavailable on some devices / simulators
  }
}

/** Soft tap — tabs, chips, hearts. */
export function hapticLight() {
  return safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Slightly stronger — confirm / primary actions. */
export function hapticMedium() {
  return safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

/** Segment / tab selection tick. */
export function hapticSelection() {
  return safe(() => Haptics.selectionAsync());
}

/** Success — order placed, saved, etc. */
export function hapticSuccess() {
  return safe(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  );
}

/** @deprecated Prefer hapticLight / hapticSelection. */
export async function playHapticFeedback() {
  return hapticLight();
}
