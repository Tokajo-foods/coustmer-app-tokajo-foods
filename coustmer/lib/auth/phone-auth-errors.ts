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
  ROLE_NOT_ALLOWED: 'This number isn’t a customer account yet. Create one — it takes a few seconds.',
  ACCOUNT_BLOCKED: 'This account is blocked. Contact support.',
  ACCOUNT_SUSPENDED: 'This account is suspended. Contact support.',
  ACCOUNT_DEACTIVATED: 'This account is deactivated. Contact support.',
  RESET_TOKEN_INVALID: 'This reset session expired or was already used. Start again.',
  RATE_LIMITED: 'Too many attempts. Please wait a few minutes and try again.',
  CURRENT_CONTACT_UNVERIFIED: 'Verify your current number again before adding the new one.',
  SAME_CONTACT: 'That is already your phone number.',
  PHONE_IN_USE: 'This number is already registered with another account.',
  CONTACT_MISSING: 'Add an email or phone number to your account first.',
  EMAIL_UNAVAILABLE: 'Email codes are not available right now. Try again later or contact support.',
  EMAIL_NOT_VERIFIED: 'Verify your email with the code we send before creating your account.',
  EMAIL_OTP_REQUIRED: 'Enter the code sent to your email.',
  PHONE_OTP_REQUIRED: 'Verify the code sent to your phone.',
  INVALID_OTP: 'That email code is incorrect.',
  INVALID_CREDENTIALS:
    'Email or mobile and password did not match. Check spelling, try Phone OTP sign-in, or reset your password.',
  PASSWORD_NOT_SET:
    'This account has no password yet. Use the Phone OTP tab to sign in, or Forgot password to set one.',
  OTP_EXPIRED: 'The email code expired. Request a new one.',
  OTP_ATTEMPTS_EXCEEDED: 'Too many wrong codes. Request a new email code.',
  OTP_RATE_LIMITED: 'Too many codes requested. Please wait before trying again.',
  CHANGE_TOKEN_INVALID: 'This session expired. Verify the codes again.',
  SAME_PASSWORD: 'Choose a password different from your current one.',
  PHONE_CHANGE_USE_FIREBASE: 'Update the app to change your phone number.',
  PASSWORD_CHANGE_USE_OTP: 'Update the app to change your password.',
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
