import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  mapRegisterApiError,
  type RegisterFieldKey,
  type RegisterFocusField,
  type RegisterStep,
} from '@/components/auth/register-form-helpers';
import { useAuthStore } from '@/store/auth-store';
import {
  normalizeIndianPhoneInput,
  validateConfirmPassword,
  validateEmail,
  validateIndianPhone,
  validateName,
  validateOptionalName,
  validateOtp,
  validatePassword,
} from '@/utils/validation';

type Options = {
  onSignIn?: () => void;
  onRegisterSuccess?: () => void;
};

export function useRegisterSignupFlow({ onSignIn, onRegisterSuccess }: Options) {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const sendRegisterOtp = useAuthStore((s) => s.sendRegisterOtp);
  const confirmRegisterOtp = useAuthStore((s) => s.confirmRegisterOtp);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [step, setStep] = useState<RegisterStep>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<RegisterFocusField>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [banner, setBanner] = useState<{ message: string; type: 'error' | 'success' } | null>(
    null,
  );

  const clearError = () => {
    if (fieldError) setFieldError(null);
  };
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

  const sendEmailOtp = async () => {
    const err = validateEmail(email);
    setFieldError(err);
    setBanner(null);
    if (err) return;
    try {
      await sendRegisterOtp(email.trim());
      setOtp('');
      setStep('email_otp');
      setBanner({ message: 'Code sent to your email. Check inbox and spam.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Failed to send code', type: 'error' });
    }
  };

  const verifyEmailOtp = async () => {
    const err = validateOtp(otp);
    setFieldError(err);
    setBanner(null);
    if (err) return;
    try {
      await confirmRegisterOtp(email.trim(), otp.trim());
      setOtp('');
      setStep('phone');
      setBanner({ message: 'Email verified. Next, verify your phone.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Invalid code', type: 'error' });
    }
  };

  const sendPhoneOtp = async () => {
    const normalized = normalizeIndianPhoneInput(phone);
    const err = validateIndianPhone(normalized, true);
    setFieldError(err);
    setBanner(null);
    if (err) return;
    setPhone(normalized);
    try {
      await sendRegisterOtp(normalized);
      setOtp('');
      setStep('phone_otp');
      setBanner({ message: 'Code sent by SMS. Enter it below.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Failed to send code', type: 'error' });
    }
  };

  const verifyPhoneOtp = async () => {
    const err = validateOtp(otp);
    setFieldError(err);
    setBanner(null);
    if (err) return;
    try {
      await confirmRegisterOtp(phone.trim(), otp.trim());
      setOtp('');
      setStep('details');
      setBanner(null);
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Invalid code', type: 'error' });
    }
  };

  const resend = async () => {
    setBanner(null);
    try {
      const id = step === 'email_otp' ? email.trim() : phone.trim();
      await sendRegisterOtp(id);
      setBanner({ message: 'A new code was sent.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Could not resend', type: 'error' });
    }
  };

  const handleRegister = async () => {
    const nextErrors = {
      firstName: validateName(firstName, 'First name'),
      lastName: validateOptionalName(lastName, 'Last name'),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setErrors(nextErrors);
    setBanner(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim(),
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
    step,
    email,
    setEmail,
    phone,
    setPhone,
    otp,
    setOtp,
    firstName,
    setFirstName,
    lastName,
    setLastName,
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
    fieldError,
    errors,
    banner,
    isLoading,
    clearError,
    clearFieldError,
    handleSignIn,
    sendEmailOtp,
    verifyEmailOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    resend,
    handleRegister,
  };
}
