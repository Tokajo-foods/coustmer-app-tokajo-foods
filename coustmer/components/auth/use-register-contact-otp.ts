import { useState, type Dispatch, type SetStateAction } from 'react';

import { useAuthStore } from '@/store/auth-store';
import {
  normalizeIndianPhoneInput,
  validateEmail,
  validateIndianPhone,
  validateOtp,
} from '@/utils/validation';

type Banner = { message: string; type: 'error' | 'success' } | null;

export function useRegisterContactOtp(
  email: string,
  phone: string,
  setPhone: (v: string) => void,
  setErrors: Dispatch<SetStateAction<Record<string, string | null>>>,
  setBanner: (b: Banner) => void,
) {
  const sendRegisterOtp = useAuthStore((s) => s.sendRegisterOtp);
  const confirmRegisterOtp = useAuthStore((s) => s.confirmRegisterOtp);

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
  const [emailExpiresAtMs, setEmailExpiresAtMs] = useState<number | null>(null);
  const [phoneExpiresAtMs, setPhoneExpiresAtMs] = useState<number | null>(null);
  const [emailCooldownEndsAtMs, setEmailCooldownEndsAtMs] = useState<number | null>(null);
  const [phoneCooldownEndsAtMs, setPhoneCooldownEndsAtMs] = useState<number | null>(null);
  const [emailExpiryTotal, setEmailExpiryTotal] = useState(600);
  const [phoneExpiryTotal, setPhoneExpiryTotal] = useState(600);

  const applyTiming = (
    channel: 'email' | 'phone',
    timing: { expiresInSeconds: number; cooldownSeconds: number },
  ) => {
    const now = Date.now();
    const expiresAt = now + timing.expiresInSeconds * 1000;
    const cooldownEnds = now + timing.cooldownSeconds * 1000;
    if (channel === 'email') {
      setEmailExpiresAtMs(expiresAt);
      setEmailCooldownEndsAtMs(cooldownEnds);
      setEmailExpiryTotal(timing.expiresInSeconds);
    } else {
      setPhoneExpiresAtMs(expiresAt);
      setPhoneCooldownEndsAtMs(cooldownEnds);
      setPhoneExpiryTotal(timing.expiresInSeconds);
    }
  };

  const resetEmailOtp = () => {
    setEmailVerified(false);
    setEmailOtpSent(false);
    setEmailOtp('');
    setEmailOtpError(null);
    setEmailExpiresAtMs(null);
    setEmailCooldownEndsAtMs(null);
  };

  const resetPhoneOtp = () => {
    setPhoneVerified(false);
    setPhoneOtpSent(false);
    setPhoneOtp('');
    setPhoneOtpError(null);
    setPhoneExpiresAtMs(null);
    setPhoneCooldownEndsAtMs(null);
  };

  const sendEmailCode = async () => {
    const err = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: err }));
    setEmailOtpError(null);
    setBanner(null);
    if (err) return;
    try {
      const timing = await sendRegisterOtp(email.trim());
      setEmailOtp('');
      setEmailOtpSent(true);
      applyTiming('email', timing);
      setBanner({ message: 'Email OTP sent. Check your inbox.', type: 'success' });
    } catch (e) {
      setBanner({
        message: e instanceof Error ? e.message : 'Failed to send email OTP',
        type: 'error',
      });
    }
  };

  const verifyEmailCode = async () => {
    const err = validateOtp(emailOtp);
    setEmailOtpError(err);
    setBanner(null);
    if (err) return;
    try {
      await confirmRegisterOtp(email.trim(), emailOtp.trim());
      setEmailVerified(true);
      setBanner({ message: 'Email verified.', type: 'success' });
    } catch (e) {
      setEmailOtpError(e instanceof Error ? e.message : 'Invalid code');
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
    try {
      const timing = await sendRegisterOtp(normalized);
      setPhoneOtp('');
      setPhoneOtpSent(true);
      applyTiming('phone', timing);
      setBanner({ message: 'Phone OTP sent by SMS.', type: 'success' });
    } catch (e) {
      setBanner({
        message: e instanceof Error ? e.message : 'Failed to send phone OTP',
        type: 'error',
      });
    }
  };

  const verifyPhoneCode = async () => {
    const err = validateOtp(phoneOtp);
    setPhoneOtpError(err);
    setBanner(null);
    if (err) return;
    try {
      await confirmRegisterOtp(phone.trim(), phoneOtp.trim());
      setPhoneVerified(true);
      setBanner({ message: 'Phone verified.', type: 'success' });
    } catch (e) {
      setPhoneOtpError(e instanceof Error ? e.message : 'Invalid code');
    }
  };

  const resendEmail = async () => {
    setBanner(null);
    try {
      const timing = await sendRegisterOtp(email.trim());
      setEmailOtp('');
      applyTiming('email', timing);
      setBanner({ message: 'A new email OTP was sent.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Could not resend', type: 'error' });
    }
  };

  const resendPhone = async () => {
    setBanner(null);
    try {
      const timing = await sendRegisterOtp(phone.trim());
      setPhoneOtp('');
      applyTiming('phone', timing);
      setBanner({ message: 'A new phone OTP was sent.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Could not resend', type: 'error' });
    }
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
      expiresAtMs: emailExpiresAtMs,
      cooldownEndsAtMs: emailCooldownEndsAtMs,
      totalExpiresSeconds: emailExpiryTotal,
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
      expiresAtMs: phoneExpiresAtMs,
      cooldownEndsAtMs: phoneCooldownEndsAtMs,
      totalExpiresSeconds: phoneExpiryTotal,
      onSend: () => void sendPhoneCode(),
      onVerify: () => void verifyPhoneCode(),
      onResend: () => void resendPhone(),
    },
  };
}
