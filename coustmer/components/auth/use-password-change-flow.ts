import { useCallback, useEffect, useState } from 'react';

import { useFirebasePhoneOtp } from '@/components/auth/use-firebase-phone-otp';
import { passwordChangeApi } from '@/lib/auth/account-security-api';
import { signOutFirebase } from '@/lib/auth/firebase-phone';
import { getAuthErrorCode } from '@/lib/auth/http';
import { describePhoneAuthError, PHONE_REVERIFY_CODES } from '@/lib/auth/phone-auth-errors';
import type { PasswordChangeStart } from '@/lib/auth/types';

export type PasswordChangeStage = 'loading' | 'verify' | 'password' | 'done';

const EMAIL_CODE_ERRORS = new Set(['INVALID_OTP', 'OTP_EXPIRED', 'OTP_ATTEMPTS_EXCEEDED', 'EMAIL_OTP_REQUIRED']);

/** Settings password change: email OTP + Firebase phone OTP → change token → new password. */
export function usePasswordChangeFlow() {
  const phoneOtp = useFirebasePhoneOtp();
  const { setPhoneInput } = phoneOtp;
  const [stage, setStage] = useState<PasswordChangeStage>('loading');
  const [info, setInfo] = useState<PasswordChangeStart | null>(null);
  const [emailCode, setEmailCodeRaw] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [changeToken, setChangeToken] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const start = useCallback(async () => {
    setBusy(true);
    setBanner(null);
    setErrorCode(null);
    try {
      const next = await passwordChangeApi.start();
      setInfo(next);
      if (next.phone) setPhoneInput(next.phone);
      setEmailNotice(
        next.emailRequired
          ? next.emailOtpSent
            ? `Code sent to ${next.maskedEmail}.`
            : `A code was sent to ${next.maskedEmail} moments ago. Use that code or resend in ${next.cooldownSeconds}s.`
          : null,
      );
      setStage('verify');
    } catch (error) {
      setErrorCode(getAuthErrorCode(error) ?? null);
      setBanner(describePhoneAuthError(error, 'Could not start the password change.'));
    } finally {
      setBusy(false);
    }
  }, [setPhoneInput]);

  useEffect(() => {
    void start();
  }, [start]);

  const setEmailCode = (value: string) => {
    setEmailCodeRaw(value.replace(/\D/g, '').slice(0, 6));
    setEmailError(null);
  };

  const resendEmail = async () => {
    setEmailCodeRaw('');
    await start();
  };

  const verifyPhoneCode = async (code: string) => {
    if (phoneOtp.verifying) return;
    setBanner(null);
    await phoneOtp.verify(code);
  };

  const emailReady = !info?.emailRequired || emailCode.length === 6;
  const phoneReady = !info?.phoneRequired || phoneOtp.step === 'verified';

  const verify = async () => {
    if (!info || busy || !emailReady || !phoneReady) return;
    setBusy(true);
    setBanner(null);
    setErrorCode(null);
    try {
      let phoneIdToken: string | undefined;
      if (info.phoneRequired) {
        const token = await phoneOtp.getIdTokenForSubmit();
        if (!token) return;
        phoneIdToken = token;
      }
      const token = await passwordChangeApi.verify({
        emailOtp: info.emailRequired ? emailCode : undefined,
        phoneIdToken,
      });
      await signOutFirebase();
      setChangeToken(token);
      setStage('password');
    } catch (error) {
      const code = getAuthErrorCode(error);
      setErrorCode(code ?? null);
      const message = describePhoneAuthError(error, 'Could not verify the codes.');
      if (code && PHONE_REVERIFY_CODES.has(code)) phoneOtp.requireReverify(message);
      else if (code && EMAIL_CODE_ERRORS.has(code)) setEmailError(message);
      else setBanner(message);
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
        phoneOtp.changeNumber();
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
    phoneOtp,
    emailCode,
    setEmailCode,
    emailError,
    emailNotice,
    resendEmail,
    verifyPhoneCode,
    canVerify: emailReady && phoneReady && !busy,
    verify,
    save,
    banner,
    errorCode,
    busy,
    retryStart: start,
  };
}

export type PasswordChangeFlow = ReturnType<typeof usePasswordChangeFlow>;
