import type { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useOtpCountdown } from '@/components/auth/use-otp-countdown';
import { usePhoneAuthStatus } from '@/components/auth/use-phone-auth-status';
import {
  describeFirebaseError,
  FIREBASE_CLIENT_NOT_CONFIGURED_MESSAGE,
  FIREBASE_RESEND_REQUIRED_CODES,
  getFirebaseErrorCode,
} from '@/lib/auth/firebase-errors';
import {
  confirmFirebasePhoneOtp,
  getFirebaseWebConfig,
  getFreshIdToken,
  getVerifiedFirebasePhone,
  isFirebasePhoneConfigured,
  NATIVE_AUTO_VERIFIED,
  nativePhoneAuthAvailable,
  signOutFirebase,
  startFirebasePhoneOtp,
} from '@/lib/auth/firebase-phone';
import { watchNativePhoneSignIn } from '@/lib/auth/firebase-phone-native';
import { FIREBASE_SERVER_NOT_CONFIGURED_MESSAGE } from '@/lib/auth/phone-auth-errors';
import { normalizePhoneE164, validatePhoneE164 } from '@/lib/auth/phone-number';
import { validateOtp } from '@/utils/validation';

export const MAX_OTP_ATTEMPTS = 5;
const LOCKED_MESSAGE = 'Too many wrong codes. Request a new OTP.';

export type PhoneOtpStep = 'phone' | 'code' | 'verified';
export type VerifiedPhone = { idToken: string; phone: string };

type Options = {
  initialPhone?: string;
  /** Runs before the first SMS for a number; a returned message blocks the send. Skipped on resend. */
  precheck?: (phoneE164: string) => Promise<string | null>;
  /** Android verified the number without a typed code (native builds only). */
  onAutoVerified?: (verified: VerifiedPhone) => void;
};

/** Firebase SMS OTP: phone → (native: Play Integrity | web: reCAPTCHA) → code → Firebase ID token. */
export function useFirebasePhoneOtp({ initialPhone, precheck, onAutoVerified }: Options = {}) {
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);
  const firebaseConfig = useMemo(() => getFirebaseWebConfig(), []);
  const native = nativePhoneAuthAvailable();
  const clientReady = isFirebasePhoneConfigured();
  const onAutoVerifiedRef = useRef(onAutoVerified);
  onAutoVerifiedRef.current = onAutoVerified;
  /** Set once a sign-in for the current SMS is owned (typed code or auto) so the watcher can't double-submit. */
  const signInClaimedRef = useRef(false);
  const { serverReady, cooldownSeconds } = usePhoneAuthStatus(clientReady);

  const [phoneInput, setPhoneInputRaw] = useState(initialPhone ?? '');
  const [phone, setPhone] = useState<string | null>(null);
  const [step, setStep] = useState<PhoneOtpStep>('phone');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCodeRaw] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [busy, setBusy] = useState<'idle' | 'sending' | 'verifying'>('idle');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const resend = useOtpCountdown(resendAt);

  const blockedReason = !clientReady
    ? FIREBASE_CLIENT_NOT_CONFIGURED_MESSAGE
    : serverReady === false
      ? FIREBASE_SERVER_NOT_CONFIGURED_MESSAGE
      : null;

  useEffect(() => {
    if (!initialPhone || !clientReady) return;
    const target = normalizePhoneE164(initialPhone);
    if (getVerifiedFirebasePhone() === target) {
      setPhone(target);
      setStep('verified');
    }
  }, [initialPhone, clientReady]);

  const setPhoneInput = (value: string) => {
    setPhoneInputRaw(value);
    setPhoneError(null);
    setError(null);
  };

  const setCode = (value: string) => {
    setCodeRaw(value.replace(/\D/g, '').slice(0, 6));
    setCodeError(null);
  };

  const lockForResend = useCallback((message: string) => {
    setVerificationId(null);
    setCodeRaw('');
    setResendAt(null);
    setStep('code');
    setCodeError(message);
  }, []);

  const markAutoVerified = useCallback(async (target: string) => {
    if (signInClaimedRef.current) return;
    signInClaimedRef.current = true;
    setPhone(target);
    setVerificationId(null);
    setCodeRaw('');
    setCodeError(null);
    setStep('verified');
    const idToken = await getFreshIdToken().catch(() => null);
    if (idToken) onAutoVerifiedRef.current?.({ idToken, phone: target });
  }, []);

  useEffect(() => {
    if (!native || step !== 'code' || !phone) return;
    return watchNativePhoneSignIn(phone, () => void markAutoVerified(phone));
  }, [native, step, phone, markAutoVerified]);

  const send = async (
    target?: string,
    { skipPrecheck = false, forceResend = false } = {},
  ): Promise<boolean> => {
    const raw = target ?? phoneInput;
    const invalid = validatePhoneE164(raw);
    setError(null);
    if (invalid) {
      setPhoneError(invalid);
      return false;
    }
    if (blockedReason) {
      setError(blockedReason);
      return false;
    }
    const verifier = recaptchaRef.current;
    if (!native && !verifier) {
      setError('Security check is still loading. Try again in a moment.');
      return false;
    }

    const e164 = normalizePhoneE164(raw);
    setBusy('sending');
    try {
      if (precheck && !skipPrecheck) {
        const blocked = await precheck(e164);
        if (blocked) {
          setStep('phone');
          setPhoneError(blocked);
          return false;
        }
      }
      signInClaimedRef.current = false;
      const id = await startFirebasePhoneOtp(e164, verifier, { forceResend });
      if (id === NATIVE_AUTO_VERIFIED) {
        await markAutoVerified(e164);
        return true;
      }
      setPhone(e164);
      setVerificationId(id);
      setStep('code');
      setCodeRaw('');
      setCodeError(null);
      setAttempts(0);
      setResendAt(Date.now() + cooldownSeconds * 1000);
      return true;
    } catch (err) {
      const message = describeFirebaseError(err, 'Could not send the OTP. Try again.');
      const fbCode = getFirebaseErrorCode(err);
      if (fbCode === 'auth/invalid-phone-number' || fbCode === 'auth/missing-phone-number') {
        setStep('phone');
        setPhoneError(message);
      } else {
        setError(message);
      }
      return false;
    } finally {
      setBusy('idle');
    }
  };

  const resendCode = async () => {
    if (resend.active || busy !== 'idle' || !phone) return false;
    return send(phone, { skipPrecheck: true, forceResend: true });
  };

  const verify = async (value?: string): Promise<VerifiedPhone | null> => {
    const entered = (value ?? code).trim();
    setError(null);
    if (!verificationId || !phone) {
      setCodeError(attempts >= MAX_OTP_ATTEMPTS ? LOCKED_MESSAGE : 'Request a new OTP to continue.');
      return null;
    }
    const invalid = validateOtp(entered);
    if (invalid) {
      setCodeError(invalid);
      return null;
    }

    if (signInClaimedRef.current) return null;
    signInClaimedRef.current = true;
    setBusy('verifying');
    try {
      const idToken = await confirmFirebasePhoneOtp(verificationId, entered);
      setStep('verified');
      return { idToken, phone };
    } catch (err) {
      signInClaimedRef.current = false;
      const fbCode = getFirebaseErrorCode(err);
      const message = describeFirebaseError(err, 'Could not verify the code. Try again.');
      if (fbCode === 'auth/invalid-verification-code') {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= MAX_OTP_ATTEMPTS) {
          lockForResend(LOCKED_MESSAGE);
        } else {
          setCodeRaw('');
          setCodeError(`Incorrect code. ${MAX_OTP_ATTEMPTS - next} attempt(s) left.`);
        }
      } else if (fbCode && FIREBASE_RESEND_REQUIRED_CODES.has(fbCode)) {
        lockForResend(message);
      } else {
        setError(message);
      }
      return null;
    } finally {
      setBusy('idle');
    }
  };

  /** Fresh ID token for the verified Firebase user; asks for a new OTP when the session is gone. */
  const getIdTokenForSubmit = async (): Promise<string | null> => {
    try {
      const token = await getFreshIdToken();
      if (token) return token;
    } catch (err) {
      setError(describeFirebaseError(err, 'Could not refresh your verification.'));
      return null;
    }
    lockForResend('Your verification expired. Resend the OTP to continue.');
    return null;
  };

  /** Server rejected the Firebase token (too old / mismatch) — redo SMS for the same number. */
  const requireReverify = (message: string) => {
    void signOutFirebase();
    lockForResend(message);
  };

  const changeNumber = () => {
    void signOutFirebase();
    setStep('phone');
    setPhone(null);
    setVerificationId(null);
    setCodeRaw('');
    setAttempts(0);
    setResendAt(null);
    setPhoneError(null);
    setCodeError(null);
    setError(null);
  };

  return {
    recaptchaRef,
    firebaseConfig,
    native,
    clientReady,
    blockedReason,
    step,
    phoneInput,
    setPhoneInput,
    phone,
    code,
    setCode,
    attemptsLeft: Math.max(0, MAX_OTP_ATTEMPTS - attempts),
    canVerify: Boolean(verificationId),
    sending: busy === 'sending',
    verifying: busy === 'verifying',
    phoneError,
    codeError,
    error,
    resendSecondsLeft: resend.secondsLeft,
    canResend: !resend.active && busy === 'idle' && Boolean(phone),
    send,
    resendCode,
    verify,
    getIdTokenForSubmit,
    requireReverify,
    changeNumber,
  };
}

export type FirebasePhoneOtp = ReturnType<typeof useFirebasePhoneOtp>;
