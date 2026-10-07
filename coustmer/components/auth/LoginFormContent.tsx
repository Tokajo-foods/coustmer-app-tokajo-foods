import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { AuthRememberSwitch } from '@/components/auth/AuthRememberSwitch';
import { loginFormStyles } from '@/components/auth/login-form-styles';
import { authTheme } from '@/constants/auth-theme';
import { useAuthStore } from '@/store/auth-store';
import {
  detectLoginIdentifierMode,
  normalizeIndianPhoneInput,
  validateEmail,
  validateIndianPhone,
  validatePassword,
} from '@/utils/validation';

type FocusField = 'identifier' | 'password' | null;

type Props = {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: () => void;
  onOtpSent?: (identifier: string) => void;
};

export function LoginFormContent({
  onSignUp,
  onForgotPassword,
  onLoginSuccess,
  onOtpSent,
}: Props) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [banner, setBanner] = useState<{ message: string; type: 'error' | 'success' } | null>(
    null,
  );

  const mode = useMemo(() => detectLoginIdentifierMode(identifier), [identifier]);
  const isEmail = mode === 'email';
  const isPhone = mode === 'phone';

  const handlePasswordLogin = async () => {
    const nextErrors = {
      identifier: validateEmail(identifier),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setBanner(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    try {
      await login({ email: identifier.trim(), password });
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
    const phone = normalizeIndianPhoneInput(identifier);
    const phoneError = validateIndianPhone(phone, true);
    setErrors({ identifier: phoneError });
    setBanner(null);
    if (phoneError) return;

    try {
      await sendOtp({ emailOrPhone: phone });
      if (onOtpSent) {
        onOtpSent(phone);
        return;
      }
      onLoginSuccess?.();
      router.push({ pathname: '/verify-otp', params: { identifier: phone } });
    } catch (error) {
      setBanner({
        message: error instanceof Error ? error.message : 'Failed to send OTP',
        type: 'error',
      });
    }
  };

  const handlePrimary = () => {
    if (isPhone) void handleSendOtp();
    else void handlePasswordLogin();
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
      return;
    }
    router.replace('/?auth=forgot-password');
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
      return;
    }
    router.replace('/?auth=sign-up');
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

  const primaryLabel = isLoading
    ? '...'
    : isPhone
      ? 'SEND OTP'
      : 'SIGN IN';

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.title}>Let's get something</Text>
        <Text style={styles.subtitle}>
          {isPhone
            ? 'Enter your phone number to get an OTP.'
            : isEmail
              ? 'Enter your email and password to sign in.'
              : 'Use email + password, or phone number for OTP.'}
        </Text>

        {banner ? (
          <View style={{ marginBottom: 16 }}>
            <AuthMessageBanner message={banner.message} type={banner.type} />
          </View>
        ) : null}

        <View style={styles.fieldWrap}>
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
              placeholder="Email or phone (+91…)"
              placeholderTextColor={authTheme.textDim}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
                if (detectLoginIdentifierMode(text) !== 'email' && password) {
                  setPassword('');
                }
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
                placeholder="Password"
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
        ) : null}

        <View style={styles.rowBetween}>
          <View style={styles.rememberInline}>
            <Text style={styles.rememberText}>Remember me</Text>
            <AuthRememberSwitch value={rememberMe} onValueChange={setRememberMe} />
          </View>
          {isEmail || mode === 'unknown' ? (
            <Pressable onPress={handleForgotPassword} hitSlop={8}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>
          ) : (
            <View style={styles.forgotSpacer} />
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={handlePrimary}
          disabled={isLoading || mode === 'unknown'}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>{primaryLabel}</Text>
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
