import type { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useMemo, useRef, useState } from 'react';

import {
  getFirebaseWebConfig,
  isFirebasePhoneConfigured,
  startFirebasePhoneOtp,
} from '@/lib/auth/firebase-phone';
import { normalizeIndianPhoneInput, validateIndianPhone } from '@/utils/validation';

type Banner = { message: string; type: 'error' | 'success' };

export function useLoginFirebaseOtp(
  identifier: string,
  setErrors: (next: Record<string, string | null>) => void,
  setBanner: (banner: Banner | null) => void,
) {
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);
  const firebaseConfig = useMemo(() => getFirebaseWebConfig(), []);
  const [sending, setSending] = useState(false);

  const send = async (): Promise<{ identifier: string; verificationId: string } | null> => {
    const phone = normalizeIndianPhoneInput(identifier);
    const phoneError = validateIndianPhone(phone, true);
    setErrors({ identifier: phoneError });
    setBanner(null);
    if (phoneError) return null;

    if (!isFirebasePhoneConfigured()) {
      setBanner({
        message:
          'Firebase Phone Auth is not configured. Add EXPO_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, and APP_ID to .env.',
        type: 'error',
      });
      return null;
    }

    const verifier = recaptchaRef.current;
    if (!verifier) {
      setBanner({ message: 'reCAPTCHA is not ready. Try again.', type: 'error' });
      return null;
    }

    setSending(true);
    try {
      const verificationId = await startFirebasePhoneOtp(phone, verifier);
      return { identifier: phone, verificationId };
    } catch (error) {
      setBanner({
        message: error instanceof Error ? error.message : 'Failed to send OTP',
        type: 'error',
      });
      return null;
    } finally {
      setSending(false);
    }
  };

  return {
    recaptchaRef,
    firebaseConfig,
    firebaseReady: isFirebasePhoneConfigured(),
    sending,
    send,
  };
}
