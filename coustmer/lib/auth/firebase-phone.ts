import Constants from 'expo-constants';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  type Auth,
} from 'firebase/auth';

import { FIREBASE_CLIENT_NOT_CONFIGURED_MESSAGE } from '@/lib/auth/firebase-errors';

type Extra = {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseAppId?: string;
  firebaseMessagingSenderId?: string;
  firebaseStorageBucket?: string;
};

/** Web client config from Expo extra / EXPO_PUBLIC_* (Firebase Console → Web app). */
export function getFirebaseWebConfig() {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  return {
    apiKey: extra.firebaseApiKey?.trim() || process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() || '',
    authDomain:
      extra.firebaseAuthDomain?.trim() ||
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ||
      '',
    projectId:
      extra.firebaseProjectId?.trim() ||
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
      '',
    appId: extra.firebaseAppId?.trim() || process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() || '',
    messagingSenderId:
      extra.firebaseMessagingSenderId?.trim() ||
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ||
      '',
    storageBucket:
      extra.firebaseStorageBucket?.trim() ||
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
      '',
  };
}

export function isFirebasePhoneConfigured(): boolean {
  const c = getFirebaseWebConfig();
  return Boolean(c.apiKey && c.projectId && c.appId && c.authDomain);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!isFirebasePhoneConfigured()) {
    throw Object.assign(new Error(FIREBASE_CLIENT_NOT_CONFIGURED_MESSAGE), {
      code: 'FIREBASE_CLIENT_NOT_CONFIGURED',
    });
  }
  if (!app) {
    const config = getFirebaseWebConfig();
    app = getApps().length ? getApps()[0]! : initializeApp(config);
    auth = getAuth(app);
  }
  return auth!;
}

/** Start Firebase phone OTP. `applicationVerifier` from FirebaseRecaptchaVerifierModal. */
export async function startFirebasePhoneOtp(
  phoneE164: string,
  applicationVerifier: { type: string; verify: () => Promise<string> },
): Promise<string> {
  const authInstance = getFirebaseAuth();
  const provider = new PhoneAuthProvider(authInstance);
  return provider.verifyPhoneNumber(phoneE164, applicationVerifier as never);
}

/** Confirm SMS code → fresh Firebase ID token for `/auth/phone/*`. */
export async function confirmFirebasePhoneOtp(
  verificationId: string,
  code: string,
): Promise<string> {
  const authInstance = getFirebaseAuth();
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const result = await signInWithCredential(authInstance, credential);
  return result.user.getIdToken(true);
}

/** E.164 phone of the Firebase user still signed in after OTP, if any. */
export function getVerifiedFirebasePhone(): string | null {
  if (!auth) return null;
  return auth.currentUser?.phoneNumber ?? null;
}

/** Force-refresh the ID token of the verified Firebase user (for retries / delayed submits). */
export async function getFreshIdToken(): Promise<string | null> {
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken(true);
}

/** Drop the Firebase session once the backend has issued `_sid` (or on change-number). */
export async function signOutFirebase(): Promise<void> {
  if (!auth?.currentUser) return;
  try {
    await signOut(auth);
  } catch {
    // local-only sign out; ignore
  }
}
