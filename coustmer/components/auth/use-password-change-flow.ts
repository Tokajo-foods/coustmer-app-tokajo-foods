import { useCallback, useEffect, useRef, useState } from 'react';

import { passwordChangeApi } from '@/lib/auth/account-security-api';
import { signOutFirebase } from '@/lib/auth/firebase-phone';
import { getAuthErrorCode } from '@/lib/auth/http';
import { describePhoneAuthError, PHONE_REVERIFY_CODES } from '@/lib/auth/phone-auth-errors';
import type { PasswordChangeStart } from '@/lib/auth/types';

export type PasswordChangeStage = 'loading' | 'verify' | 'password' | 'done' | 'startFailed';

const EMAIL_CODE_ERRORS = new Set(['INVALID_OTP', 'OTP_EXPIRED', 'OTP_ATTEMPTS_EXCEEDED', 'EMAIL_OTP_REQUIRED']);

function buildEmailNotice(next: PasswordChangeStart): string | null {
  if (!next.emailRequired || !next.maskedEmail) return null;
  if (next.emailOtpSent) return `Code sent to ${next.maskedEmail}.`;
  return `A code was sent to ${next.maskedEmail} recently. Use that code or tap resend after ${next.cooldownSeconds}s.`;
}

/** Settings password change: email OTP + Firebase phone OTP → change token → new password. */
export function usePasswordChangeFlow() {
  const [stage, setStage] = useState<PasswordChangeStage>('loading');
  const [info, setInfo] = useState<PasswordChangeStart | null>(null);
  const [emailCode, setEmailCodeRaw] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [phoneIdToken, setPhoneIdToken] = useState<string | null>(null);
  const [changeToken, setChangeToken] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const startOnceRef = useRef(false);

  const start = useCallback(async () => {
    setBusy(true);
    setBanner(null);
    setErrorCode(null);
    setPhoneIdToken(null);
    try {
      const next = await passwordChangeApi.start();
      setInfo(next);
      setEmailNotice(buildEmailNotice(next));
      setStage('verify');
    } catch (error) {
      setErrorCode(getAuthErrorCode(error) ?? null);
      setBanner(describePhoneAuthError(error, 'Could not start the password change.'));
      setStage('startFailed');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (startOnceRef.current) return;
    startOnceRef.current = true;
    void start();
  }, [start]);

  const retryStart = () => {
    setStage('loading');
    setBanner(null);
    setErrorCode(null);
    void start();
  };

  const setEmailCode = (value: string) => {
    setEmailCodeRaw(value.replace(/\D/g, '').slice(0, 6));
    setEmailError(null);
  };

  const resendEmail = async () => {
    if (busy || !info?.emailRequired) return;
    setEmailCodeRaw('');
    setEmailError(null);
    setBanner(null);
    setBusy(true);
    try {
      const next = await passwordChangeApi.start();
      setInfo(next);
      setEmailNotice(buildEmailNotice(next));
      setStage('verify');
    } catch (error) {
      setBanner(describePhoneAuthError(error, 'Could not resend the email code.'));
    } finally {
      setBusy(false);
    }
  };

  const emailReady = !info?.emailRequired || emailCode.length === 6;
  const phoneReady = !info?.phoneRequired || Boolean(phoneIdToken);

  const verifyHint = (() => {
    if (!info || stage !== 'verify') return null;
    if (info.emailRequired && emailCode.length < 6) return 'Enter the 6-digit code from your email.';
    if (info.phoneRequired && !phoneIdToken) return 'Send and verify the SMS code on your phone.';
    return null;
  })();

  const verify = async () => {
    if (!info || busy || !emailReady || !phoneReady) return;
    setBusy(true);
    setBanner(null);
    setErrorCode(null);
    try {
      const token = await passwordChangeApi.verify({
        emailOtp: info.emailRequired ? emailCode : undefined,
        phoneIdToken: info.phoneRequired ? phoneIdToken ?? undefined : undefined,
      });
      await signOutFirebase();
      setChangeToken(token);
      setStage('password');
    } catch (error) {
      const code = getAuthErrorCode(error);
      setErrorCode(code ?? null);
      const message = describePhoneAuthError(error, 'Could not verify the codes.');
      if (code && PHONE_REVERIFY_CODES.has(code)) {
        setPhoneIdToken(null);
        setBanner(message);
      } else if (code && EMAIL_CODE_ERRORS.has(code)) {
        setEmailError(message);
      } else {
        setBanner(message);
      }
    } finally {
      setBusy(false);
    }
  };

  const save = async (newPassword: string): Promise<boolean> => {
    if (!changeToken || busy) return false;
    setBusy(true);
    setBanner(null);
    setErrorCode(null);
    try {
      await passwordChangeApi.confirm(changeToken, newPassword);
      setStage('done');
      return true;
    } catch (error) {
      const code = getAuthErrorCode(error);
      setErrorCode(code ?? null);
      setBanner(describePhoneAuthError(error, 'Could not save the new password.'));
      if (code === 'CHANGE_TOKEN_INVALID') {
        setChangeToken(null);
        setEmailCodeRaw('');
        setPhoneIdToken(null);
        setStage('verify');
        void start();
      }
      return false;
    } finally {
      setBusy(false);
    }
  };

  return {
    stage,
    info,
    emailCode,
    setEmailCode,
    emailError,
    emailNotice,
    resendEmail,
    phoneIdToken,
    setPhoneIdToken,
    canVerify: emailReady && phoneReady && !busy,
    verifyHint,
    verify,
    save,
    banner,
    setBanner,
    errorCode,
    busy,
    retryStart,
  };
}

export type PasswordChangeFlow = ReturnType<typeof usePasswordChangeFlow>;
