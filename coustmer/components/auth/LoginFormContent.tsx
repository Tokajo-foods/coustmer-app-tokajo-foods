import { Pressable } from '@/components/common/Pressable';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { AuthRememberSwitch } from '@/components/auth/AuthRememberSwitch';
import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import { LoginModeTabs, type LoginModePref } from '@/components/auth/LoginModeTabs';
import { useLoginFirebaseOtp } from '@/components/auth/use-login-firebase-otp';
import { loginFormStyles } from '@/components/auth/login-form-styles';
import { authTheme } from '@/constants/auth-theme';
import { useAuthStore } from '@/store/auth-store';
import {
  detectLoginIdentifierMode,
  validateEmail,
  validateLoginPassword,
} from '@/utils/validation';

type FocusField = 'identifier' | 'password' | null;

export type LoginOtpSentPayload = {
  identifier: string;
  verificationId: string;
};

type Props = {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: () => void;
  onOtpSent?: (payload: LoginOtpSentPayload) => void;
};

export function LoginFormContent({
  onSignUp,
  onForgotPassword,
  onLoginSuccess,
  onOtpSent,
}: Props) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [pref, setPref] = useState<LoginModePref>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [banner, setBanner] = useState<{ message: string; type: 'error' | 'success' } | null>(
    null,
  );
  const phoneOtp = useLoginFirebaseOtp(identifier, setErrors, setBanner);

  const detected = useMemo(() => detectLoginIdentifierMode(identifier), [identifier]);

  useEffect(() => {
    if (detected === 'email') setPref('email');
    if (detected === 'phone') setPref('phone');
  }, [detected]);

  const isEmail = pref === 'email';
  const isPhone = pref === 'phone';
  const busy = isLoading || phoneOtp.sending;

  const handlePasswordLogin = async () => {
    const nextErrors = {
      identifier: validateEmail(identifier),
      password: validateLoginPassword(password),
    };
    setErrors(nextErrors);
    setBanner(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    try {
      await login({ email: identifier.trim().toLowerCase(), password });
      onLoginSuccess?.();
      router.replace('/home');
    } catch (error) {
      setBanner({
        message: error instanceof Error ? error.message : 'Login failed',
        type: 'error',
      });
    }
  };

  const handleSendOtp = async () => {
    const sent = await phoneOtp.send();
    if (!sent) return;
    if (onOtpSent) {
      onOtpSent(sent);
      return;
    }
    onLoginSuccess?.();
    router.push({
      pathname: '/verify-otp',
      params: { identifier: sent.identifier, verificationId: sent.verificationId },
    });
  };

  const handlePrimary = () => {
    if (isPhone) void handleSendOtp();
    else void handlePasswordLogin();
  };

  const handleForgotPassword = () =>
    onForgotPassword ? onForgotPassword() : router.replace('/?auth=forgot-password');
  const handleSignUp = () =>
    onSignUp ? onSignUp() : router.replace('/?auth=sign-up');

  const onChangePref = (next: LoginModePref) => {
    setPref(next);
    setErrors({});
    setBanner(null);
    if (next === 'phone') setPassword('');
  };

  const inputStyle = (field: FocusField, hasError: boolean) => [
    styles.inputContainer,
    focusedField === field && styles.inputFocused,
    hasError && styles.inputError,
  ];

  const iconColor = (field: FocusField, hasError: boolean) => {
    if (hasError) return authTheme.error;
    if (focusedField === field) return authTheme.brand;
    return authTheme.textDim;
  };

  return (
    <View style={{ flex: 1 }}>
      {phoneOtp.firebaseReady ? (
        <FirebaseRecaptchaVerifierModal
          ref={phoneOtp.recaptchaRef}
          firebaseConfig={phoneOtp.firebaseConfig}
          attemptInvisibleVerification
        />
      ) : null}

      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LoginFormHeader
          title={isPhone ? 'Sign in with phone' : 'Welcome back'}
          subtitle={isPhone ? 'We’ll text a Firebase one-time code.' : 'Sign in with your Gmail and password.'}
        />

        <LoginModeTabs value={pref} onChange={onChangePref} />

        {banner ? (
          <View style={{ marginBottom: 16 }}>
            <AuthMessageBanner message={banner.message} type={banner.type} />
          </View>
        ) : null}

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{isPhone ? 'Phone number' : 'Email'}</Text>
          <View style={inputStyle('identifier', Boolean(errors.identifier))}>
            <View
              style={[
                styles.iconCircle,
                focusedField === 'identifier' && styles.iconCircleFocused,
              ]}
            >
              {isPhone ? (
                <Phone
                  color={iconColor('identifier', Boolean(errors.identifier))}
                  size={18}
                  strokeWidth={2}
                />
              ) : (
                <Mail
                  color={iconColor('identifier', Boolean(errors.identifier))}
                  size={18}
                  strokeWidth={2}
                />
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder={isPhone ? '+91 98765 43210' : 'you@gmail.com'}
              placeholderTextColor={authTheme.textDim}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
              }}
              keyboardType={isPhone ? 'phone-pad' : 'email-address'}
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
              onFocus={() => setFocusedField('identifier')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          {errors.identifier ? <Text style={styles.errorText}>{errors.identifier}</Text> : null}
        </View>

        {isEmail ? (
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={inputStyle('password', Boolean(errors.password))}>
              <View
                style={[
                  styles.iconCircle,
                  focusedField === 'password' && styles.iconCircleFocused,
                ]}
              >
                <Lock
                  color={iconColor('password', Boolean(errors.password))}
                  size={18}
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={authTheme.textDim}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                secureTextEntry={!showPassword}
                underlineColorAndroid="transparent"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
                style={styles.rightSlot}
              >
                {showPassword ? (
                  <EyeOff color={authTheme.textMuted} size={20} />
                ) : (
                  <Eye color={authTheme.textMuted} size={20} />
                )}
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>
        ) : (
          <View style={styles.hintCard}>
            <Text style={styles.hintTitle}>Firebase OTP login</Text>
            <Text style={styles.hintBody}>
              Tap Send OTP, enter the code Firebase texts you, and you’re in.
            </Text>
          </View>
        )}

        <View style={styles.rowBetween}>
          <View style={styles.rememberInline}>
            <Text style={styles.rememberText}>Remember me</Text>
            <AuthRememberSwitch value={rememberMe} onValueChange={setRememberMe} />
          </View>
          {isEmail ? (
            <Pressable onPress={handleForgotPassword} hitSlop={8}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>
          ) : (
            <View style={styles.forgotSpacer} />
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, busy && styles.submitBtnDisabled]}
          onPress={handlePrimary}
          disabled={busy}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>
            {busy ? '...' : isPhone ? 'SEND OTP' : 'SIGN IN'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomLinks}>
          <Text style={styles.signupText}>
            Don&apos;t have an account?{' '}
            <Text style={styles.signupLink} onPress={handleSignUp}>
              Sign up
            </Text>
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

export { loginFormStyles } from '@/components/auth/login-form-styles';

const styles = loginFormStyles;
