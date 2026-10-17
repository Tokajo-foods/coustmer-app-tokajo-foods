import { create } from 'zustand';

type State = {
  notServiceableName: string | null;
  showNotServiceable: (name: string) => void;
  clearNotServiceable: () => void;
};

export const useRestaurantShareUiStore = create<State>((set) => ({
  notServiceableName: null,
  showNotServiceable: (name) => set({ notServiceableName: name }),
  clearNotServiceable: () => set({ notServiceableName: null }),
}));
