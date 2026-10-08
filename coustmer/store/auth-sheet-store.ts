import { create } from 'zustand';

export type AuthSheetView = 'login' | 'register' | 'forgot-password' | 'verify-otp';

type OtpSheetOptions = {
  otpIdentifier?: string;
  /** Firebase PhoneAuth verificationId (phone login). */
  otpVerificationId?: string;
};

type AuthSheetState = {
  visible: boolean;
  view: AuthSheetView;
  otpIdentifier?: string;
  otpVerificationId?: string;
  open: (view?: AuthSheetView, options?: OtpSheetOptions) => void;
  close: () => void;
  setView: (view: AuthSheetView, options?: OtpSheetOptions) => void;
};

export const useAuthSheetStore = create<AuthSheetState>((set) => ({
  visible: false,
  view: 'login',
  otpIdentifier: undefined,
  otpVerificationId: undefined,
  open: (view = 'login', options) =>
    set({
      visible: true,
      view,
      otpIdentifier: options?.otpIdentifier,
      otpVerificationId: options?.otpVerificationId,
    }),
  close: () =>
    set({
      visible: false,
      view: 'login',
      otpIdentifier: undefined,
      otpVerificationId: undefined,
    }),
  setView: (view, options) =>
    set({
      view,
      otpIdentifier: options?.otpIdentifier,
      otpVerificationId: options?.otpVerificationId,
    }),
}));
