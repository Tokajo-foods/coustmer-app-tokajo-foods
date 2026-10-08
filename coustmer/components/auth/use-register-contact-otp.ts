import type { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useState, type Dispatch, type RefObject, type SetStateAction } from 'react';

import { useAuthStore } from '@/store/auth-store';
import {
  confirmFirebasePhoneOtp,
  isFirebasePhoneConfigured,
  startFirebasePhoneOtp,
} from '@/lib/auth/firebase-phone';
import {
  normalizeIndianPhoneInput,
  validateEmail,
  validateIndianPhone,
  validateOtp,
} from '@/utils/validation';

type Banner = { message: string; type: 'error' | 'success' } | null;
type ChannelBusy = 'idle' | 'sending' | 'verifying' | 'resending';

const DEFAULT_VALIDITY = 600;
const DEFAULT_COOLDOWN = 30;
const FIREBASE_VALIDITY = 300;

export function useRegisterContactOtp(
  email: string,
  phone: string,
  setPhone: (v: string) => void,
  setErrors: Dispatch<SetStateAction<Record<string, string | null>>>,
  setBanner: (b: Banner) => void,
  recaptchaRef: RefObject<FirebaseRecaptchaVerifierModal | null>,
) {
  const sendRegisterOtp = useAuthStore((s) => s.sendRegisterOtp);
  const resendRegisterOtp = useAuthStore((s) => s.resendRegisterOtp);
  const confirmRegisterOtp = useAuthStore((s) => s.confirmRegisterOtp);
  const confirmFirebasePhone = useAuthStore((s) => s.confirmFirebasePhone);

  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);
  const [phoneOtpError, setPhoneOtpError] = useState<string | null>(null);
  const [emailOtpFocused, setEmailOtpFocused] = useState(false);
  const [phoneOtpFocused, setPhoneOtpFocused] = useState(false);
  const [emailTimerKey, setEmailTimerKey] = useState(0);
  const [phoneTimerKey, setPhoneTimerKey] = useState(0);
  const [emailValiditySeconds, setEmailValiditySeconds] = useState(DEFAULT_VALIDITY);
  const [phoneValiditySeconds, setPhoneValiditySeconds] = useState(DEFAULT_VALIDITY);
  const [emailCooldownSeconds, setEmailCooldownSeconds] = useState(DEFAULT_COOLDOWN);
  const [phoneCooldownSeconds, setPhoneCooldownSeconds] = useState(DEFAULT_COOLDOWN);
  const [emailBusy, setEmailBusy] = useState<ChannelBusy>('idle');
  const [phoneBusy, setPhoneBusy] = useState<ChannelBusy>('idle');
  const [phoneVerificationId, setPhoneVerificationId] = useState<string | null>(null);

  const applyTiming = (
    channel: 'email' | 'phone',
    timing?: { expiresInSeconds?: number; cooldownSeconds?: number },
  ) => {
    const validity =
      channel === 'phone'
        ? FIREBASE_VALIDITY
        : Math.max(1, Number(timing?.expiresInSeconds) || DEFAULT_VALIDITY);
    const cooldown = Math.max(1, Number(timing?.cooldownSeconds) || DEFAULT_COOLDOWN);
    if (channel === 'email') {
      setEmailValiditySeconds(validity);
      setEmailCooldownSeconds(cooldown);
      setEmailTimerKey((k) => k + 1);
    } else {
      setPhoneValiditySeconds(validity);
      setPhoneCooldownSeconds(cooldown);
      setPhoneTimerKey((k) => k + 1);
    }
  };

  const resetEmailOtp = () => {
    setEmailVerified(false);
    setEmailOtpSent(false);
    setEmailOtp('');
    setEmailOtpError(null);
    setEmailBusy('idle');
  };

  const resetPhoneOtp = () => {
    setPhoneVerified(false);
    setPhoneOtpSent(false);
    setPhoneOtp('');
    setPhoneOtpError(null);
    setPhoneBusy('idle');
    setPhoneVerificationId(null);
  };

  const sendEmailCode = async () => {
    const err = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: err }));
    setEmailOtpError(null);
    setBanner(null);
    if (err) return;
    setEmailBusy('sending');
    try {
      const timing = await sendRegisterOtp(email.trim().toLowerCase());
      setEmailOtp('');
      setEmailOtpSent(true);
      applyTiming('email', timing);
      setBanner({ message: 'Email OTP sent. Check your inbox.', type: 'success' });
    } catch (e) {
      setBanner({
        message: e instanceof Error ? e.message : 'Failed to send email OTP',
        type: 'error',
      });
    } finally {
      setEmailBusy('idle');
    }
  };

  const verifyEmailCode = async () => {
    const err = validateOtp(emailOtp);
    setEmailOtpError(err);
    setBanner(null);
    if (err) return;
    setEmailBusy('verifying');
    try {
      await confirmRegisterOtp(email.trim().toLowerCase(), emailOtp.trim());
      setEmailVerified(true);
      setBanner({ message: 'Email verified.', type: 'success' });
    } catch (e) {
      setEmailOtpError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setEmailBusy('idle');
    }
  };

  const sendPhoneCode = async () => {
    const normalized = normalizeIndianPhoneInput(phone);
    const err = validateIndianPhone(normalized, true);
    setErrors((prev) => ({ ...prev, phone: err }));
    setPhoneOtpError(null);
    setBanner(null);
    if (err) return;
    setPhone(normalized);

    if (!isFirebasePhoneConfigured()) {
      setBanner({
        message:
          'Firebase Phone Auth is not configured. Add EXPO_PUBLIC_FIREBASE_* keys to .env.',
        type: 'error',
      });
      return;
    }
    const verifier = recaptchaRef.current;
    if (!verifier) {
      setBanner({ message: 'reCAPTCHA is not ready. Try again.', type: 'error' });
      return;
    }

    setPhoneBusy('sending');
    try {
      const verificationId = await startFirebasePhoneOtp(normalized, verifier);
      setPhoneVerificationId(verificationId);
      setPhoneOtp('');
      setPhoneOtpSent(true);
      applyTiming('phone', { expiresInSeconds: FIREBASE_VALIDITY, cooldownSeconds: DEFAULT_COOLDOWN });
      setBanner({ message: 'Phone OTP sent via Firebase.', type: 'success' });
    } catch (e) {
      setBanner({
        message: e instanceof Error ? e.message : 'Failed to send phone OTP',
        type: 'error',
      });
    } finally {
      setPhoneBusy('idle');
    }
  };

  const verifyPhoneCode = async () => {
    const err = validateOtp(phoneOtp);
    setPhoneOtpError(err);
    setBanner(null);
    if (err) return;
    if (!phoneVerificationId) {
      setPhoneOtpError('Request a phone OTP first.');
      return;
    }
    setPhoneBusy('verifying');
    try {
      const idToken = await confirmFirebasePhoneOtp(phoneVerificationId, phoneOtp.trim());
      await confirmFirebasePhone(idToken);
      setPhoneVerified(true);
      setBanner({ message: 'Phone verified.', type: 'success' });
    } catch (e) {
      setPhoneOtpError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setPhoneBusy('idle');
    }
  };

  const resendEmail = async () => {
    setBanner(null);
    setEmailBusy('resending');
    try {
      const timing = await resendRegisterOtp(email.trim().toLowerCase());
      setEmailOtp('');
      applyTiming('email', timing);
      setBanner({ message: 'A new email OTP was sent.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Could not resend', type: 'error' });
    } finally {
      setEmailBusy('idle');
    }
  };

  const resendPhone = async () => {
    setBanner(null);
    await sendPhoneCode();
  };

  return {
    emailVerified,
    phoneVerified,
    resetEmailOtp,
    resetPhoneOtp,
    emailOtpBlock: {
      verified: emailVerified,
      otpSent: emailOtpSent,
      otp: emailOtp,
      setOtp: (v: string) => {
        setEmailOtp(v);
        if (emailOtpError) setEmailOtpError(null);
      },
      otpError: emailOtpError,
      focused: emailOtpFocused,
      setFocused: setEmailOtpFocused,
      timerKey: emailTimerKey,
      validitySeconds: emailValiditySeconds,
      cooldownSeconds: emailCooldownSeconds,
      isLoading: emailBusy !== 'idle',
      busyMode: emailBusy,
      onSend: () => void sendEmailCode(),
      onVerify: () => void verifyEmailCode(),
      onResend: () => void resendEmail(),
    },
    phoneOtpBlock: {
      verified: phoneVerified,
      otpSent: phoneOtpSent,
      otp: phoneOtp,
      setOtp: (v: string) => {
        setPhoneOtp(v);
        if (phoneOtpError) setPhoneOtpError(null);
      },
      otpError: phoneOtpError,
      focused: phoneOtpFocused,
      setFocused: setPhoneOtpFocused,
      timerKey: phoneTimerKey,
      validitySeconds: phoneValiditySeconds,
      cooldownSeconds: phoneCooldownSeconds,
      isLoading: phoneBusy !== 'idle',
      busyMode: phoneBusy,
      onSend: () => void sendPhoneCode(),
      onVerify: () => void verifyPhoneCode(),
      onResend: () => void resendPhone(),
    },
  };
}
