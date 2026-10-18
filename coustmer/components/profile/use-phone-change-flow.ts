import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useFirebasePhoneOtp } from '@/components/auth/use-firebase-phone-otp';
import { phoneChangeApi } from '@/lib/auth/account-security-api';
import { signOutFirebase } from '@/lib/auth/firebase-phone';
import { getAuthErrorCode } from '@/lib/auth/http';
import { describePhoneAuthError, PHONE_REVERIFY_CODES } from '@/lib/auth/phone-auth-errors';
import { normalizePhoneE164 } from '@/lib/auth/phone-number';
import { profileKeys } from '@/lib/profile/hooks';

export type PhoneChangeStage = 'current' | 'new' | 'done';

/** Settings phone change: Firebase OTP on the current number, then on the new number. */
export function usePhoneChangeFlow(currentPhoneRaw: string | null | undefined) {
  const queryClient = useQueryClient();
  const currentPhone = currentPhoneRaw?.trim() ? normalizePhoneE164(currentPhoneRaw) : null;
  const [stage, setStage] = useState<PhoneChangeStage>(currentPhone ? 'current' : 'new');
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);

  const currentOtp = useFirebasePhoneOtp({ initialPhone: currentPhone ?? undefined });
  const newOtp = useFirebasePhoneOtp({
    precheck: async (phone) =>
      phone === currentPhone ? 'That is already your phone number. Enter a different one.' : null,
  });

  const submitCurrent = async (idToken: string) => {
    setSaving(true);
    setBanner(null);
    try {
      await phoneChangeApi.verifyCurrent(idToken);
      await signOutFirebase();
      setStage('new');
    } catch (error) {
      const code = getAuthErrorCode(error);
      const message = describePhoneAuthError(error, 'Could not verify your current number.');
      if (code === 'CONTACT_MISSING') setStage('new');
      else if (code && PHONE_REVERIFY_CODES.has(code)) currentOtp.requireReverify(message);
      else setBanner(message);
    } finally {
      setSaving(false);
    }
  };

  const submitNew = async (idToken: string) => {
    setSaving(true);
    setBanner(null);
    try {
      const phone = await phoneChangeApi.confirmNew(idToken);
      await signOutFirebase();
      setSavedPhone(phone || newOtp.phone);
      setStage('done');
      await queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    } catch (error) {
      const code = getAuthErrorCode(error);
      const message = describePhoneAuthError(error, 'Could not update your phone number.');
      if (code === 'CURRENT_CONTACT_UNVERIFIED') {
        newOtp.changeNumber();
        currentOtp.changeNumber();
        setStage('current');
        setBanner(message);
      } else if (code === 'PHONE_IN_USE' || code === 'SAME_CONTACT') {
        newOtp.changeNumber();
        setBanner(message);
      } else if (code && PHONE_REVERIFY_CODES.has(code)) {
        newOtp.requireReverify(message);
      } else {
        setBanner(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const verifyCurrentCode = async (code: string) => {
    if (saving || currentOtp.verifying) return;
    const verified = await currentOtp.verify(code);
    if (verified) await submitCurrent(verified.idToken);
  };

  /** Firebase still holds a recent sign-in for the current number — reuse it. */
  const continueWithVerifiedCurrent = async () => {
    const token = await currentOtp.getIdTokenForSubmit();
    if (token) await submitCurrent(token);
  };

  const verifyNewCode = async (code: string) => {
    if (saving || newOtp.verifying) return;
    const verified = await newOtp.verify(code);
    if (verified) await submitNew(verified.idToken);
  };

  const continueWithVerifiedNew = async () => {
    const token = await newOtp.getIdTokenForSubmit();
    if (token) await submitNew(token);
  };

  return {
    stage,
    currentPhone,
    currentOtp,
    newOtp,
    banner,
    saving,
    savedPhone,
    verifyCurrentCode,
    continueWithVerifiedCurrent,
    verifyNewCode,
    continueWithVerifiedNew,
  };
}
