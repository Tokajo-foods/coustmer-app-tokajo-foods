import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ParsedRestaurantShareLink } from '@/lib/restaurant/share-link';

type PendingRestaurantShare = ParsedRestaurantShareLink & {
  capturedAt: number;
};

type State = {
  pending: PendingRestaurantShare | null;
  setPending: (link: ParsedRestaurantShareLink) => void;
  clearPending: () => void;
};

export const usePendingRestaurantShareStore = create<State>()(
  persist(
    (set) => ({
      pending: null,
      setPending: (link) =>
        set({
          pending: {
            ...link,
            capturedAt: Date.now(),
          },
        }),
      clearPending: () => set({ pending: null }),
    }),
    {
      name: 'tokajo-pending-restaurant-share',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ pending: s.pending }),
    }
  )
);
