import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  mapRegisterApiError,
  type RegisterFieldKey,
} from '@/components/auth/register-form-helpers';
import { useFirebasePhoneOtp } from '@/components/auth/use-firebase-phone-otp';
import { getAuthErrorCode } from '@/lib/auth/http';
import { describePhoneAuthError, PHONE_REVERIFY_CODES } from '@/lib/auth/phone-auth-errors';
import { useAuthStore } from '@/store/auth-store';
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validateOptionalName,
  validatePassword,
} from '@/utils/validation';

type Options = {
  /** Already-verified number handed over from sign-in (USER_NOT_FOUND). */
  initialPhone?: string;
  onSignIn?: () => void;
  onRegisterSuccess?: () => void;
};

export type RegisterValues = Record<RegisterFieldKey, string>;

const EMPTY_VALUES: RegisterValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  referralCode: '',
};

/** Phone → Firebase OTP → details → POST /auth/phone/register. */
export function useRegisterSignupFlow({ initialPhone, onSignIn, onRegisterSuccess }: Options) {
  const router = useRouter();
  const otp = useFirebasePhoneOtp({ initialPhone });
  const registerWithPhone = useAuthStore((s) => s.registerWithPhone);
  const loginWithPhone = useAuthStore((s) => s.loginWithPhone);

  const [values, setValues] = useState<RegisterValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<RegisterFieldKey, string | null>>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: RegisterFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));
  };

  const finish = () => {
    onRegisterSuccess?.();
    router.replace('/home');
  };

  const handleSessionError = (error: unknown, fallback: string) => {
    const code = getAuthErrorCode(error);
    const message = describePhoneAuthError(error, fallback);
    if (code && PHONE_REVERIFY_CODES.has(code)) {
      otp.requireReverify(message);
      return true;
    }
    if (code === 'PHONE_ALREADY_REGISTERED') {
      setAlreadyRegistered(true);
      setBanner(message);
      return true;
    }
    return false;
  };

  const handleVerify = async (code: string) => {
    if (otp.verifying) return;
    setBanner(null);
    await otp.verify(code);
  };

  const validate = () => {
    const next = {
      firstName: validateName(values.firstName, 'First name'),
      lastName: validateOptionalName(values.lastName, 'Last name'),
      email: validateEmail(values.email, false),
      password: validatePassword(values.password),
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleRegister = async () => {
    setBanner(null);
    setAlreadyRegistered(false);
    if (!otp.phone || !validate()) return;

    setSubmitting(true);
    try {
      const idToken = await otp.getIdTokenForSubmit();
      if (!idToken) return;
      await registerWithPhone({
        idToken,
        phone: otp.phone,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        referralCode: values.referralCode,
      });
      finish();
    } catch (error) {
      if (handleSessionError(error, 'Could not create your account.')) return;
      const mapped = mapRegisterApiError(error);
      if (mapped.fields) setErrors((prev) => ({ ...prev, ...mapped.fields }));
      if (mapped.message) setBanner(mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  /** PHONE_ALREADY_REGISTERED → the number is already verified, so sign straight in. */
  const signInWithVerifiedPhone = async () => {
    if (!otp.phone) return;
    setSubmitting(true);
    setBanner(null);
    try {
      const idToken = await otp.getIdTokenForSubmit();
      if (!idToken) return;
      await loginWithPhone({ idToken, phone: otp.phone });
      finish();
    } catch (error) {
      if (handleSessionError(error, 'Sign in failed. Try again.')) return;
      setBanner(describePhoneAuthError(error, 'Sign in failed. Try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = () => (onSignIn ? onSignIn() : router.replace('/?auth=login'));

  const changeNumber = () => {
    setBanner(null);
    setAlreadyRegistered(false);
    otp.changeNumber();
  };

  return {
    otp,
    values,
    setField,
    errors,
    banner,
    alreadyRegistered,
    submitting,
    handleVerify,
    handleRegister,
    signInWithVerifiedPhone,
    handleSignIn,
    changeNumber,
  };
}
