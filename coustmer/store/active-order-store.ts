import { create } from 'zustand';

import type { Order } from '@/lib/order/types';

type ActiveOrderState = {
  order: Order | null;
  setOrder: (order: Order | null) => void;
};

/** Synced from `ActiveOrderSync` so non-React code (add-to-cart) can gate new items. */
export const useActiveOrderStore = create<ActiveOrderState>((set) => ({
  order: null,
  setOrder: (order) => set({ order }),
}));
