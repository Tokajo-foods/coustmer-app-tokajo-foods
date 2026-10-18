import { create } from 'zustand';

export type AuthSheetView = 'login' | 'register' | 'forgot-password';

type AuthSheetOptions = {
  /** Number from a sign-in attempt with no account, carried into sign-up. */
  registerPhone?: string;
};

type AuthSheetState = {
  visible: boolean;
  view: AuthSheetView;
  registerPhone?: string;
  open: (view?: AuthSheetView, options?: AuthSheetOptions) => void;
  close: () => void;
  setView: (view: AuthSheetView, options?: AuthSheetOptions) => void;
};

export const useAuthSheetStore = create<AuthSheetState>((set) => ({
  visible: false,
  view: 'login',
  registerPhone: undefined,
  open: (view = 'login', options) =>
    set({ visible: true, view, registerPhone: options?.registerPhone }),
  close: () => set({ visible: false, view: 'login', registerPhone: undefined }),
  setView: (view, options) => set({ view, registerPhone: options?.registerPhone }),
}));
