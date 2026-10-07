import { authTheme } from '@/constants/auth-theme';

export type ForgotStep = 'email' | 'otp' | 'password' | 'done';

export type ForgotChromeProps = {
  focused: string | null;
  fieldError: string | null;
  setFocused: (key: string | null) => void;
};

export function forgotFieldTint(focused: string | null, key: string, err: boolean) {
  if (err) return authTheme.error;
  if (focused === key) return authTheme.brand;
  return authTheme.textDim;
}
