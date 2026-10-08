import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DeliveryLocation = {
  label: string;
  formattedAddress: string;
  city?: string;
  lat: number;
  lng: number;
  source: 'gps' | 'search' | 'saved';
  /** When set, checkout can send addressId to order-service. */
  savedAddressId?: string;
  /**
   * True after the pin has been checked against the address text.
   * GPS pins are trusted immediately. Search/saved pins stay false until
   * the address string and coordinates agree.
   */
  pinTrusted?: boolean;
  updatedAt: number;
};

type DeliveryLocationState = {
  location: DeliveryLocation | null;
  /** Last confirmed pin per logged-in user — restored on next login. */
  locationsByUserId: Record<string, DeliveryLocation>;
  boundUserId: string | null;
  isDetecting: boolean;
  /** Shown when device location or app permission is off. */
  locationGate: 'idle' | 'off' | 'denied';
  locationPromptDismissed: boolean;
  hasHydrated: boolean;
  /** Nearby/home queries wait until the pin matches the selected address. */
  pinReady: boolean;
  setLocation: (location: DeliveryLocation) => void;
  setPinReady: (ready: boolean) => void;
  setDetecting: (detecting: boolean) => void;
  setLocationGate: (gate: 'idle' | 'off' | 'denied') => void;
  dismissLocationPrompt: () => void;
  setHasHydrated: (value: boolean) => void;
  clearLocation: () => void;
  /** Restore (or claim) this user's saved delivery pin after login / session hydrate. */
  bindUser: (userId: string) => void;
  /** Persist active pin under the user and clear the header until they log in again. */
  unbindUser: () => void;
};

export const useDeliveryLocationStore = create<DeliveryLocationState>()(
  persist(
    (set) => ({
      location: null,
      locationsByUserId: {},
      boundUserId: null,
      isDetecting: false,
      locationGate: 'idle',
      locationPromptDismissed: false,
      hasHydrated: false,
      pinReady: false,
      setLocation: (location) =>
        set((state) => {
          const pinReady = location.source === 'gps' || location.pinTrusted === true;
          if (!state.boundUserId) {
            return { location, isDetecting: false, pinReady };
          }
          return {
            location,
            isDetecting: false,
            pinReady,
            locationsByUserId: {
              ...state.locationsByUserId,
              [state.boundUserId]: location,
            },
          };
        }),
      setPinReady: (pinReady) => set({ pinReady }),
      setDetecting: (isDetecting) => set({ isDetecting }),
      setLocationGate: (locationGate) => set({ locationGate }),
      dismissLocationPrompt: () =>
        set({ locationGate: 'idle', locationPromptDismissed: true }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearLocation: () => set({ location: null, isDetecting: false, pinReady: true }),
      bindUser: (userId) =>
        set((state) => {
          const saved = state.locationsByUserId[userId];
          if (saved) {
            return {
              boundUserId: userId,
              location: saved,
              isDetecting: false,
              pinReady: saved.source === 'gps' || saved.pinTrusted === true,
            };
          }

          // First login on this device: keep the pin they already picked as guest.
          if (state.location) {
            return {
              boundUserId: userId,
              locationsByUserId: {
                ...state.locationsByUserId,
                [userId]: state.location,
              },
            };
          }

          return { boundUserId: userId };
        }),
      unbindUser: () =>
        set((state) => {
          if (!state.boundUserId) return state;

          const locationsByUserId = { ...state.locationsByUserId };
          if (state.location) {
            locationsByUserId[state.boundUserId] = state.location;
          }
          return {
            boundUserId: null,
            locationsByUserId,
            location: null,
            isDetecting: false,
            pinReady: true,
          };
        }),
    }),
    {
      name: 'delivery-location',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        location: state.location,
        locationsByUserId: state.locationsByUserId,
        boundUserId: state.boundUserId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        const loc = state?.location;
        if (!loc || loc.source === 'gps' || loc.pinTrusted) {
          state?.setPinReady(true);
        }
      },
    }
  )
);

export function useDeliveryCoords(): { lat: number; lng: number } | null {
  const location = useDeliveryLocationStore((s) => s.location);
  const pinReady = useDeliveryLocationStore((s) => s.pinReady);
  if (!pinReady || !location) return null;
  return { lat: location.lat, lng: location.lng };
}
