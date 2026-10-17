import { Platform, Share } from 'react-native';

/** Copy without a top-level expo-clipboard import (dev clients built before share). */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const value = text.trim();
  if (!value) return false;

  try {
    const mod = await import('expo-clipboard');
    await mod.setStringAsync(value);
    return true;
  } catch {
    // Native module missing — fall back without crashing route registration.
  }

  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  try {
    await Share.share({ message: value });
    return true;
  } catch {
    return false;
  }
}
