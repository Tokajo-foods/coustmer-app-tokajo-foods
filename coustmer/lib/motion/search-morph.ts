import { useSyncExternalStore } from 'react';
import { Easing } from 'react-native-reanimated';

export type MorphRect = { x: number; y: number; width: number; height: number };

type Origin = { rect: MorphRect; hint: string; at: number };

/** An origin older than this belongs to a tap that never opened search. */
const ORIGIN_TTL_MS = 2000;

let pending: Origin | null = null;

/** Home search pill, in window coordinates, recorded just before navigating. */
export function setSearchOrigin(rect: MorphRect, hint: string): void {
  pending = { rect, hint, at: Date.now() };
}

/** Read once by the search screen. Null when search was opened from anywhere else. */
export function takeSearchOrigin(): Origin | null {
  const origin = pending;
  pending = null;
  if (!origin || Date.now() - origin.at > ORIGIN_TTL_MS || origin.rect.width <= 0) return null;
  return origin;
}

let sourceHidden = false;
const listeners = new Set<() => void>();

/** Hides the home pill while its copy is on screen, so there are never two. */
export function setSearchSourceHidden(hidden: boolean): void {
  if (sourceHidden === hidden) return;
  sourceHidden = hidden;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSearchSourceHidden(): boolean {
  return useSyncExternalStore(subscribe, () => sourceHidden);
}

export const SEARCH_MORPH = {
  openMs: 420,
  closeMs: 300,
  openEasing: Easing.bezier(0.22, 1, 0.36, 1),
  closeEasing: Easing.bezier(0.4, 0, 0.2, 1),
  /** Home pill look → search bar look. */
  from: { radius: 18, bg: '#FFFFFF', border: '#F1E7DE', shadow: 0.12, elevation: 4 },
  to: { radius: 12, bg: '#F8FAFC', border: 'rgba(241,231,222,0)', shadow: 0, elevation: 0 },
} as const;
