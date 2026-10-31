import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { ForgotPhoneReset } from '@/components/auth/ForgotPhoneReset';
import {
  ForgotEmailStep,
  ForgotOtpStep,
  ForgotPasswordFields,
  ForgotStepIndicator,
  ForgotSuccessStep,
  type ForgotStep,
} from '@/components/auth/ForgotPasswordSteps';
import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import { authApi } from '@/lib/auth/api';
import { getApiErrorMessage } from '@/lib/errors';
import {
  validateConfirmPassword,
  validateEmail,
  validateOtp,
  validatePassword,
} from '@/utils/validation';

type Props = {
  onBackToLogin?: () => void;
  /** `screen` = inside ProfileFormLayout (no sheet, no KeyboardAwareScrollView). */
  layout?: 'sheet' | 'screen';
};

function maskEmail(email: string) {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at < 1) return trimmed;
  const name = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${'•'.repeat(Math.max(name.length - visible.length, 2))}${domain}`;
}

export function ForgotPasswordFormContent({ onBackToLogin, layout = 'sheet' }: Props) {
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const isLoading = sending || confirming || saving;

  const [channel, setChannel] = useState<'phone' | 'email'>('email');
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
    setSending(true);
    try {
      await authApi.sendOtp({ emailOrPhone: email.trim(), purpose: 'forgot_password' });
      setOtp('');
      setStep('otp');
      setBanner({
        message: 'Code sent. Check your email inbox (and spam).',
        type: 'success',
      });
    } catch (e) {
      setBanner({
        message: getApiErrorMessage(e, 'Failed to send code'),
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    const err = validateOtp(otp);
    setFieldError(err);
    setBanner(null);
    if (err) return;
    setConfirming(true);
    try {
      await authApi.confirmForgotPasswordOtp(email.trim(), otp.trim());
      setStep('password');
      setBanner(null);
    } catch (e) {
      setBanner({
        message: getApiErrorMessage(e, 'Invalid code'),
        type: 'error',
      });
    } finally {
      setConfirming(false);
    }
  };

  const savePassword = async () => {
    const pwdErr = validatePassword(password);
    const confErr = validateConfirmPassword(password, confirm);
    setFieldError(pwdErr || confErr);
    setBanner(null);
    if (pwdErr || confErr) return;
    setSaving(true);
    try {
      await authApi.resetPassword({
        identifier: email.trim(),
        password,
        confirmPassword: confirm,
      });
      setStep('done');
      setBanner(null);
    } catch (e) {
      setBanner({
        message: getApiErrorMessage(e, 'Could not save password'),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const resend = async () => {
    setBanner(null);
    setSending(true);
    try {
      await authApi.sendOtp({ emailOrPhone: email.trim(), purpose: 'forgot_password' });
      setBanner({ message: 'A new code was sent to your email.', type: 'success' });
    } catch (e) {
      setBanner({
        message: getApiErrorMessage(e, 'Could not resend code'),
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  const isScreen = layout === 'screen';

  const body = (
    <>
      {step !== 'done' && !isScreen ? (
        <View style={styles.header}>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your account email and we’ll send a verification code.
          </Text>
        </View>
      ) : null}

      {step !== 'done' ? (
        <>
          {channel === 'email' ? <ForgotStepIndicator step={step} /> : null}
          <View style={styles.rowBetween}>
            <Pressable
              onPress={() => {
                setChannel('phone');
                setStep('email');
                setBanner(null);
              }}
            >
              <Text style={channel === 'phone' ? styles.signupLink : styles.signupText}>
                Phone OTP
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setChannel('email');
                setBanner(null);
              }}
            >
              <Text style={channel === 'email' ? styles.signupLink : styles.signupText}>
                Email code
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {channel === 'phone' && step !== 'done' ? (
        <ForgotPhoneReset onDone={() => setStep('done')} />
      ) : null}

      {banner ? (
        <View style={{ marginBottom: 12 }}>
          <AuthMessageBanner message={banner.message} type={banner.type} />
        </View>
      ) : null}

      {channel === 'email' && step === 'otp' && !isScreen ? (
        <Text style={[styles.subtitle, { marginBottom: 12 }]}>
          Enter the 6-digit code sent to{' '}
          <Text style={styles.emailHighlight}>{maskEmail(email)}</Text>.
        </Text>
      ) : null}

      {channel === 'email' && step === 'email' ? (
        <ForgotEmailStep
          {...chrome}
          email={email}
          setEmail={setEmail}
          clearError={clearError}
          onSubmit={() => void sendOtp()}
          isLoading={isLoading}
        />
      ) : null}

      {channel === 'email' && step === 'otp' ? (
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

      {channel === 'email' && step === 'password' ? (
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
    </>
  );

  if (isScreen) {
    return (
      <ScrollView
        style={{ flex: 1 }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={styles.scrollContent}
      >
        {body}
      </ScrollView>
    );
  }

  return <View style={{ flex: 1 }}>{body}</View>;
}
