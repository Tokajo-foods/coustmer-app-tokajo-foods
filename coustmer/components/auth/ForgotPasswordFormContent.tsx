import { useState } from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import {
  ForgotEmailStep,
  ForgotOtpStep,
  ForgotPasswordFields,
  ForgotStepIndicator,
  ForgotSuccessStep,
  type ForgotStep,
} from '@/components/auth/ForgotPasswordSteps';
import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import { useAuthStore } from '@/store/auth-store';
import {
  validateConfirmPassword,
  validateEmail,
  validateOtp,
  validatePassword,
} from '@/utils/validation';

type Props = {
  onBackToLogin?: () => void;
};

export function ForgotPasswordFormContent({ onBackToLogin }: Props) {
  const sendForgotPasswordOtp = useAuthStore((s) => s.sendForgotPasswordOtp);
  const confirmForgotPasswordOtp = useAuthStore((s) => s.confirmForgotPasswordOtp);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ message: string; type: 'error' | 'success' } | null>(
    null,
  );

  const clearError = () => {
    if (fieldError) setFieldError(null);
  };

  const chrome = { focused, fieldError, setFocused };

  const sendOtp = async () => {
    const err = validateEmail(email);
    setFieldError(err);
    setBanner(null);
    if (err) return;
    try {
      await sendForgotPasswordOtp(email.trim());
      setStep('otp');
      setBanner({
        message: 'We sent a 6-digit code to your email. Check your inbox.',
        type: 'success',
      });
    } catch (e) {
      setBanner({
        message: e instanceof Error ? e.message : 'Failed to send OTP',
        type: 'error',
      });
    }
  };

  const verifyOtp = async () => {
    const err = validateOtp(otp);
    setFieldError(err);
    setBanner(null);
    if (err) return;
    try {
      await confirmForgotPasswordOtp(email.trim(), otp.trim());
      setStep('password');
      setBanner({ message: 'OTP verified. Choose a new password.', type: 'success' });
    } catch (e) {
      setBanner({
        message: e instanceof Error ? e.message : 'Invalid OTP',
        type: 'error',
      });
    }
  };

  const savePassword = async () => {
    const pwdErr = validatePassword(password);
    const confErr = validateConfirmPassword(password, confirm);
    setFieldError(pwdErr || confErr);
    setBanner(null);
    if (pwdErr || confErr) return;
    try {
      await resetPassword({
        identifier: email.trim(),
        password,
        confirmPassword: confirm,
      });
      setStep('done');
      setBanner(null);
    } catch (e) {
      setBanner({
        message: e instanceof Error ? e.message : 'Could not save password',
        type: 'error',
      });
    }
  };

  const resend = async () => {
    setBanner(null);
    try {
      await sendForgotPasswordOtp(email.trim());
      setBanner({ message: 'A new OTP was sent to your email.', type: 'success' });
    } catch (e) {
      setBanner({
        message: e instanceof Error ? e.message : 'Could not resend OTP',
        type: 'error',
      });
    }
  };

  const title =
    step === 'email'
      ? 'Forgot password'
      : step === 'otp'
        ? 'Enter OTP'
        : step === 'password'
          ? 'New password'
          : 'Password updated';

  const subtitle =
    step === 'email'
      ? 'Enter the email on your account. We’ll send a one-time code.'
      : step === 'otp'
        ? `Enter the 6-digit code sent to ${email.trim()}.`
        : step === 'password'
          ? 'Create a strong password and confirm it below.'
          : 'You can sign in with your new password.';

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <ForgotStepIndicator step={step} />

        {banner ? (
          <View style={{ marginBottom: 12 }}>
            <AuthMessageBanner message={banner.message} type={banner.type} />
          </View>
        ) : null}

        {step === 'email' ? (
          <ForgotEmailStep
            {...chrome}
            email={email}
            setEmail={setEmail}
            clearError={clearError}
            onSubmit={() => void sendOtp()}
            isLoading={isLoading}
          />
        ) : null}

        {step === 'otp' ? (
          <ForgotOtpStep
            {...chrome}
            otp={otp}
            setOtp={setOtp}
            clearError={clearError}
            onSubmit={() => void verifyOtp()}
            onResend={() => void resend()}
            isLoading={isLoading}
          />
        ) : null}

        {step === 'password' ? (
          <ForgotPasswordFields
            {...chrome}
            password={password}
            confirm={confirm}
            setPassword={setPassword}
            setConfirm={setConfirm}
            clearError={clearError}
            onSubmit={() => void savePassword()}
            isLoading={isLoading}
          />
        ) : null}

        {step === 'done' ? <ForgotSuccessStep onSignIn={onBackToLogin} /> : null}

        {step !== 'done' && onBackToLogin ? (
          <View style={styles.bottomLinks}>
            <Text style={styles.signupText}>
              Remember your password?{' '}
              <Text style={styles.signupLink} onPress={onBackToLogin}>
                Sign in
              </Text>
            </Text>
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
}
