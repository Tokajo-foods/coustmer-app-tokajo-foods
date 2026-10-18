import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'customer.review.prompt.dismissed.v1';
const MAX_IDS = 50;

/** Orders the customer closed the rating popup for ("Not now"), newest first. */
export async function loadDismissedRatingPrompts(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export async function dismissRatingPrompt(orderId: string): Promise<string[]> {
  const existing = await loadDismissedRatingPrompts();
  const next = [orderId, ...existing.filter((id) => id !== orderId)].slice(0, MAX_IDS);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage failure only means the popup may show again next launch.
  }
  return next;
}
