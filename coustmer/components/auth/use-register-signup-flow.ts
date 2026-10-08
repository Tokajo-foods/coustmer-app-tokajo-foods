import type { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import {
  mapRegisterApiError,
  type RegisterFieldKey,
  type RegisterFocusField,
} from '@/components/auth/register-form-helpers';
import { useRegisterContactOtp } from '@/components/auth/use-register-contact-otp';
import { getFirebaseWebConfig, isFirebasePhoneConfigured } from '@/lib/auth/firebase-phone';
import { useAuthStore } from '@/store/auth-store';
import {
  normalizeIndianPhoneInput,
  validateConfirmPassword,
  validateEmail,
  validateIndianPhone,
  validateName,
  validateOptionalName,
  validatePassword,
} from '@/utils/validation';

type Options = {
  onSignIn?: () => void;
  onRegisterSuccess?: () => void;
};

export function useRegisterSignupFlow({ onSignIn, onRegisterSuccess }: Options) {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<RegisterFocusField>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [banner, setBanner] = useState<{ message: string; type: 'error' | 'success' } | null>(
    null,
  );

  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);
  const contactOtp = useRegisterContactOtp(
    email,
    phone,
    setPhone,
    setErrors,
    setBanner,
    recaptchaRef,
  );

  const clearFieldError = (field: RegisterFieldKey) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: null } : prev));
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
      return;
    }
    router.replace('/?auth=login');
  };

  const onChangeEmail = (v: string) => {
    setEmail(v);
    if (contactOtp.emailVerified || contactOtp.emailOtpBlock.otpSent) {
      contactOtp.resetEmailOtp();
    }
  };

  const onChangePhone = (v: string) => {
    setPhone(v);
    if (contactOtp.phoneVerified || contactOtp.phoneOtpBlock.otpSent) {
      contactOtp.resetPhoneOtp();
    }
  };

  const handleRegister = async () => {
    const nextErrors = {
      firstName: validateName(firstName, 'First name'),
      lastName: validateOptionalName(lastName, 'Last name'),
      email: validateEmail(email),
      phone: validateIndianPhone(normalizeIndianPhoneInput(phone), true),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setErrors(nextErrors);
    setBanner(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    if (!contactOtp.emailVerified) {
      setBanner({ message: 'Verify your email OTP before creating the account.', type: 'error' });
      return;
    }
    if (!contactOtp.phoneVerified) {
      setBanner({ message: 'Verify your phone OTP before creating the account.', type: 'error' });
      return;
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim().toLowerCase(),
        phone: normalizeIndianPhoneInput(phone),
        password,
        confirmPassword,
        referralCode: referralCode.trim() || undefined,
      });
      onRegisterSuccess?.();
      router.replace('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      const mapped = mapRegisterApiError(message);
      if (mapped.field) {
        setErrors({ [mapped.field]: mapped.message });
        return;
      }
      setBanner({ message, type: 'error' });
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    phone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    referralCode,
    setReferralCode,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    focusedField,
    setFocusedField,
    errors,
    banner,
    isLoading,
    clearFieldError,
    handleSignIn,
    handleRegister,
    onChangeEmail,
    onChangePhone,
    emailOtpBlock: contactOtp.emailOtpBlock,
    phoneOtpBlock: contactOtp.phoneOtpBlock,
    recaptchaRef,
    firebaseConfig: getFirebaseWebConfig(),
    firebaseReady: isFirebasePhoneConfigured(),
  };
}
