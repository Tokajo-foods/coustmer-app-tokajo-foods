import { useCallback, useState } from 'react';

import { authApi } from '@/lib/auth/api';
import { AuthApiError } from '@/lib/auth/http';
import { describePhoneAuthError } from '@/lib/auth/phone-auth-errors';
import { validateEmail } from '@/utils/validation';

export type RegisterEmailOtpBusy = 'idle' | 'sending' | 'verifying' | 'resending';

/** Register flow: POST /otp/send (register) → POST /otp/confirm-register. */
export function useRegisterEmailOtp() {
  const [verified, setVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtpRaw] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState<RegisterEmailOtpBusy>('idle');
  const [timerKey, setTimerKey] = useState(0);
  const [focused, setFocused] = useState(false);

  const reset = useCallback(() => {
    setVerified(false);
    setOtpSent(false);
    setOtpRaw('');
    setOtpError(null);
    setBanner(null);
    setBusy('idle');
    setTimerKey((k) => k + 1);
  }, []);

  const setOtp = (value: string) => {
    setOtpRaw(value.replace(/\D/g, '').slice(0, 6));
    setOtpError(null);
  };

  const send = async (emailRaw: string, { resend = false } = {}) => {
    const email = emailRaw.trim().toLowerCase();
    const invalid = validateEmail(email, true);
    if (invalid) {
      setOtpError(invalid);
      return false;
    }
    setBanner(null);
    setOtpError(null);
    setBusy(resend ? 'resending' : 'sending');
    try {
      await authApi.sendOtp({ emailOrPhone: email, purpose: 'register' });
      setOtpSent(true);
      setOtpRaw('');
      setTimerKey((k) => k + 1);
      return true;
    } catch (error) {
      const message = describePhoneAuthError(error, 'Could not send the email code.');
      if (error instanceof AuthApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setOtpError(message);
      } else {
        setBanner(message);
      }
      return false;
    } finally {
      setBusy('idle');
    }
  };

  const verify = async (emailRaw: string) => {
    const email = emailRaw.trim().toLowerCase();
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit code from your email');
      return false;
    }
    setBusy('verifying');
    setOtpError(null);
    setBanner(null);
    try {
      await authApi.confirmRegisterOtp(email, otp);
      setVerified(true);
      return true;
    } catch (error) {
      setOtpError(describePhoneAuthError(error, 'That code did not work. Try again.'));
      return false;
    } finally {
      setBusy('idle');
    }
  };

  return {
    verified,
    otpSent,
    otp,
    setOtp,
    otpError,
    banner,
    busy,
    busyMode: busy,
    timerKey,
    focused,
    setFocused,
    reset,
    send,
    verify,
    resend: (email: string) => send(email, { resend: true }),
  };
}

export type RegisterEmailOtp = ReturnType<typeof useRegisterEmailOtp>;
