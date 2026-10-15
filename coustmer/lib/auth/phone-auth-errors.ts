import { AuthApiError } from '@/lib/auth/http';

export const FIREBASE_SERVER_NOT_CONFIGURED_MESSAGE =
  'Phone OTP is not available yet — server Firebase credentials are missing.';

const CODE_MESSAGES: Record<string, string> = {
  FIREBASE_NOT_CONFIGURED: FIREBASE_SERVER_NOT_CONFIGURED_MESSAGE,
  FIREBASE_UNAVAILABLE: 'Phone verification is temporarily unavailable. Try again in a minute.',
  FIREBASE_TOKEN_INVALID: 'Phone verification failed. Request a new OTP and try again.',
  FIREBASE_TOKEN_EXPIRED: 'Your phone verification is too old. Resend the OTP to continue.',
  PHONE_MISMATCH: 'The verified number does not match. Verify the same number again.',
  PHONE_ALREADY_REGISTERED: 'This number already has an account. Sign in instead.',
  EMAIL_ALREADY_EXISTS: 'This email is already used by another account.',
  USER_NOT_FOUND: 'No account for this number.',
  ACCOUNT_NOT_FOUND: 'No account for this number.',
  ROLE_NOT_ALLOWED: 'This number belongs to a partner account. Use the partner app to sign in.',
  ACCOUNT_BLOCKED: 'This account is blocked. Contact support.',
  ACCOUNT_SUSPENDED: 'This account is suspended. Contact support.',
  ACCOUNT_DEACTIVATED: 'This account is deactivated. Contact support.',
  RESET_TOKEN_INVALID: 'This reset session expired or was already used. Start again.',
  RATE_LIMITED: 'Too many attempts. Please wait a few minutes and try again.',
};

/** Codes where the Firebase verification must be redone (new SMS). */
export const PHONE_REVERIFY_CODES = new Set([
  'FIREBASE_TOKEN_EXPIRED',
  'FIREBASE_TOKEN_INVALID',
  'PHONE_MISMATCH',
]);

export function describePhoneAuthError(error: unknown, fallback: string): string {
  if (error instanceof AuthApiError) {
    if (error.code && CODE_MESSAGES[error.code]) return CODE_MESSAGES[error.code];
    if (error.status === 429) return CODE_MESSAGES.RATE_LIMITED;
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
