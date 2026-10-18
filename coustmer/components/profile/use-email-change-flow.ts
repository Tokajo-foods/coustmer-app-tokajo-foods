import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useOtpCountdown } from '@/components/auth/use-otp-countdown';
import { getAuthErrorCode } from '@/lib/auth/http';
import { describePhoneAuthError } from '@/lib/auth/phone-auth-errors';
import { emailChangeApi, type EmailOtpSent } from '@/lib/profile/email-change-api';
import { profileKeys } from '@/lib/profile/hooks';

export type EmailChangeStage = 'current' | 'new' | 'code' | 'done';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMAIL_COPY: Record<string, string> = {
  EMAIL_IN_USE: 'This email is already used by another account.',
  SAME_CONTACT: 'That is already your email.',
  CONTACT_CHANGE_EXPIRED: 'This code request expired. Send a new code.',
  CURRENT_CONTACT_UNVERIFIED: 'Verify your current email again before adding the new one.',
  OTP_COOLDOWN: 'Please wait a moment before requesting another code.',
  INVALID_OTP: 'That code is incorrect.',
  OTP_EXPIRED: 'The code expired. Request a new one.',
};

function describe(error: unknown, fallback: string): string {
  const code = getAuthErrorCode(error);
  return (code && EMAIL_COPY[code]) || describePhoneAuthError(error, fallback);
}

/** Settings email change: code to the current email (skipped if none), then to the new email. */
export function useEmailChangeFlow(currentEmailRaw: string | null | undefined) {
  const queryClient = useQueryClient();
  const currentEmail = currentEmailRaw?.trim() || null;
  const [stage, setStage] = useState<EmailChangeStage>(currentEmail ? 'current' : 'new');
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [code, setCodeState] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const resend = useOtpCountdown(resendAt);

  const setCode = (value: string) => setCodeState(value.replace(/\D/g, '').slice(0, 6));

  const run = async (task: () => Promise<void>, fallback: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (err) {
      const errCode = getAuthErrorCode(err);
      if (errCode === 'CURRENT_CONTACT_UNVERIFIED' && currentEmail) {
        setStage('current');
        setCodeSentTo(null);
      } else if (errCode === 'CONTACT_CHANGE_EXPIRED') {
        setStage('new');
      }
      setError(describe(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const markSent = (sent: EmailOtpSent) => {
    setCodeSentTo(sent.maskedTarget);
    setCode('');
    setResendAt(Date.now() + sent.cooldownSeconds * 1000);
  };

  const sendCurrent = () =>
    run(async () => markSent(await emailChangeApi.sendCurrent()), 'Could not send a code to your current email.');

  const verifyCurrent = (override?: string) =>
    run(async () => {
      const value = override ?? code;
      if (value.length !== 6) throw new Error('Enter the 6-digit code.');
      await emailChangeApi.verifyCurrent(value);
      setCodeSentTo(null);
      setCode('');
      setResendAt(null);
      setStage('new');
    }, 'Could not verify the code.');

  const sendNew = () =>
    run(async () => {
      const value = newEmail.trim().toLowerCase();
      if (!EMAIL_RE.test(value)) throw new Error('Enter a valid email address.');
      if (value === currentEmail?.toLowerCase()) throw new Error(EMAIL_COPY.SAME_CONTACT);
      markSent(await emailChangeApi.sendNew(value));
      setNewEmail(value);
      setStage('code');
    }, 'Could not send a code to the new email.');

  const confirm = (override?: string) =>
    run(async () => {
      const value = override ?? code;
      if (value.length !== 6) throw new Error('Enter the 6-digit code.');
      await emailChangeApi.confirm(newEmail, value);
      setStage('done');
      await queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    }, 'Could not update your email.');

  const resendCode = () =>
    stage === 'current'
      ? sendCurrent()
      : run(async () => markSent(await emailChangeApi.sendNew(newEmail)), 'Could not resend the code.');

  return {
    stage,
    currentEmail,
    codeSentTo,
    code,
    setCode,
    newEmail,
    setNewEmail,
    error,
    busy,
    resendSecondsLeft: resend.secondsLeft,
    sendCurrent,
    verifyCurrent,
    sendNew,
    confirm,
    resendCode,
    editNewEmail: () => {
      setError(null);
      setStage('new');
    },
  };
}

export type EmailChangeFlow = ReturnType<typeof useEmailChangeFlow>;
