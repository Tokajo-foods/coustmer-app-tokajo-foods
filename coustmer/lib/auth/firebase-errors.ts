export const FIREBASE_CLIENT_NOT_CONFIGURED_MESSAGE =
  'Phone OTP is not configured in this build. Add the EXPO_PUBLIC_FIREBASE_* keys and restart Expo.';

const FIREBASE_MESSAGES: Record<string, string> = {
  'auth/invalid-phone-number': 'Enter a valid mobile number.',
  'auth/missing-phone-number': 'Enter your mobile number.',
  'auth/too-many-requests': 'Too many OTP requests from this device. Try again later.',
  'auth/quota-exceeded': 'SMS limit reached for now. Try again later.',
  'auth/invalid-verification-code': 'Incorrect code. Check the SMS and try again.',
  'auth/missing-verification-code': 'Enter the 6-digit code.',
  'auth/code-expired': 'This code has expired. Request a new OTP.',
  'auth/session-expired': 'This code has expired. Request a new OTP.',
  'auth/invalid-verification-id': 'OTP session expired. Request a new OTP.',
  'auth/missing-verification-id': 'OTP session expired. Request a new OTP.',
  'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
  'auth/captcha-check-failed': 'Security check failed. Try sending the OTP again.',
  'auth/invalid-app-credential': 'Security check failed. Try sending the OTP again.',
  'auth/missing-app-credential': 'Security check failed. Try sending the OTP again.',
  'auth/operation-not-allowed':
    'Phone sign-in is disabled for this app. Enable the Phone provider in Firebase Console.',
  'auth/app-not-authorized':
    'Phone sign-in is not set up for this app version yet. Use email sign-in or update the app.',
  'auth/missing-client-identifier':
    'Phone sign-in is not set up for this app version yet. Use email sign-in or update the app.',  'auth/unauthorized-domain':
    'This app domain is not authorized in Firebase. Add it under Authentication → Settings.',
  'auth/user-disabled': 'This phone number has been disabled.',
  'auth/invalid-api-key': FIREBASE_CLIENT_NOT_CONFIGURED_MESSAGE,
  ERR_FIREBASE_RECAPTCHA_CANCEL: 'Verification cancelled. Tap Send OTP to try again.',
  ERR_FIREBASE_RECAPTCHA_ERROR: 'Could not load the security check. Check your connection.',
  ERR_FIREBASE_RECAPTCHA_CONFIG: FIREBASE_CLIENT_NOT_CONFIGURED_MESSAGE,
  FIREBASE_CLIENT_NOT_CONFIGURED: FIREBASE_CLIENT_NOT_CONFIGURED_MESSAGE,
};

/** Codes after which the current verificationId is useless — user must resend. */
export const FIREBASE_RESEND_REQUIRED_CODES = new Set([
  'auth/code-expired',
  'auth/session-expired',
  'auth/invalid-verification-id',
  'auth/missing-verification-id',
]);

export function getFirebaseErrorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}

export function describeFirebaseError(error: unknown, fallback: string): string {
  const code = getFirebaseErrorCode(error);
  if (code && FIREBASE_MESSAGES[code]) return FIREBASE_MESSAGES[code];
  if (error instanceof Error && /cancel/i.test(error.message)) {
    return FIREBASE_MESSAGES.ERR_FIREBASE_RECAPTCHA_CANCEL;
  }
  return fallback;
}
