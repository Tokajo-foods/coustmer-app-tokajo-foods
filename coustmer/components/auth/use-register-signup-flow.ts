import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  mapRegisterApiError,
  type RegisterFieldKey,
  type RegisterFocusField,
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
    if (emailVerified || emailOtpSent) {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtp('');
      setEmailOtpError(null);
    }
  };

  const onChangePhone = (v: string) => {
    setPhone(v);
    if (phoneVerified || phoneOtpSent) {
      setPhoneVerified(false);
      setPhoneOtpSent(false);
      setPhoneOtp('');
      setPhoneOtpError(null);
    }
  };

  const sendEmailCode = async () => {
    const err = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: err }));
    setEmailOtpError(null);
    setBanner(null);
    if (err) return;
    try {
      await sendRegisterOtp(email.trim());
      setEmailOtp('');
      setEmailOtpSent(true);
      setBanner({ message: 'Email OTP sent. Check your inbox.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Failed to send email OTP', type: 'error' });
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
      await sendRegisterOtp(normalized);
      setPhoneOtp('');
      setPhoneOtpSent(true);
      setBanner({ message: 'Phone OTP sent by SMS.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Failed to send phone OTP', type: 'error' });
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
      await sendRegisterOtp(email.trim());
      setBanner({ message: 'A new email OTP was sent.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Could not resend', type: 'error' });
    }
  };

  const resendPhone = async () => {
    setBanner(null);
    try {
      await sendRegisterOtp(phone.trim());
      setBanner({ message: 'A new phone OTP was sent.', type: 'success' });
    } catch (e) {
      setBanner({ message: e instanceof Error ? e.message : 'Could not resend', type: 'error' });
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

    if (!emailVerified) {
      setBanner({ message: 'Verify your email OTP before creating the account.', type: 'error' });
      return;
    }
    if (!phoneVerified) {
      setBanner({ message: 'Verify your phone OTP before creating the account.', type: 'error' });
      return;
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
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
      onSend: () => void sendPhoneCode(),
      onVerify: () => void verifyPhoneCode(),
      onResend: () => void resendPhone(),
    },
  };
}
