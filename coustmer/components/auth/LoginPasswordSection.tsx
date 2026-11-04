import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Smartphone } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { AuthRememberSwitch } from '@/components/auth/AuthRememberSwitch';
import { loginFormStyles as styles } from '@/components/auth/login-form-styles';
import { authTheme } from '@/constants/auth-theme';
import {
  AUTH_EMAIL_PLACEHOLDER,
  LOGIN_IDENTIFIER_PLACEHOLDER,
} from '@/lib/auth/auth-form-copy';
import { useAuthStore } from '@/store/auth-store';
import { describePhoneAuthError } from '@/lib/auth/phone-auth-errors';
import {
  detectLoginIdentifierMode,
  isValidIndianPhone,
  normalizeIndianPhoneInput,
  validateEmail,
  validateLoginPassword,
} from '@/utils/validation';

type FocusField = 'identifier' | 'password' | null;

type Props = {
  onForgotPassword: () => void;
  onLoginSuccess?: () => void;
};

function parseLoginIdentifier(raw: string): { email?: string; phone?: string; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: 'Enter your email or mobile number' };

  const mode = detectLoginIdentifierMode(trimmed);
  if (mode === 'email' || trimmed.includes('@')) {
    const err = validateEmail(trimmed, true);
    if (err) return { error: err };
    return { email: trimmed.toLowerCase() };
  }

  const phone = normalizeIndianPhoneInput(trimmed);
  if (!isValidIndianPhone(phone)) {
    return { error: 'Enter a valid email or 10-digit mobile number' };
  }
  return { phone };
}

/** Email or +91 mobile + password (single identifier field). */
export function LoginPasswordSection({ onForgotPassword, onLoginSuccess }: Props) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const idMode = useMemo(() => detectLoginIdentifierMode(identifier), [identifier]);
  const IdIcon = idMode === 'phone' ? Smartphone : Mail;
  const placeholder =
    idMode === 'phone' ? '98765 43210 or +91…' : idMode === 'email' ? AUTH_EMAIL_PLACEHOLDER : LOGIN_IDENTIFIER_PLACEHOLDER;

  const handleLogin = async () => {
    const parsed = parseLoginIdentifier(identifier);
    const pwdErr = validateLoginPassword(password);
    setIdentifierError(parsed.error ?? null);
    setPasswordError(pwdErr);
    setBanner(null);
    if (parsed.error || pwdErr) return;

    try {
      await login(
        parsed.email
          ? { email: parsed.email, password }
          : { phone: parsed.phone!, password },
      );
      onLoginSuccess?.();
      router.replace('/home');
    } catch (error) {
      setBanner(
        describePhoneAuthError(error, 'Login failed. Check your email or mobile and password.'),
      );
    }
  };

  const idFocused = focusedField === 'identifier';
  const pwdFocused = focusedField === 'password';

  return (
    <>
      {banner ? <AuthMessageBanner message={banner} type="error" /> : null}

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Email or mobile</Text>
        <View
          style={[
            styles.inputContainer,
            idFocused && styles.inputFocused,
            identifierError && styles.inputError,
          ]}
        >
          <View style={[styles.iconCircle, idFocused && styles.iconCircleFocused]}>
            <IdIcon
              color={
                identifierError ? authTheme.error : idFocused ? authTheme.brand : authTheme.textDim
              }
              size={18}
              strokeWidth={2}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={authTheme.textDim}
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              if (identifierError) setIdentifierError(null);
            }}
            keyboardType={idMode === 'phone' ? 'phone-pad' : 'email-address'}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            underlineColorAndroid="transparent"
            onFocus={() => setFocusedField('identifier')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
        {identifierError ? <Text style={styles.errorText}>{identifierError}</Text> : null}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Password</Text>
        <View
          style={[
            styles.inputContainer,
            pwdFocused && styles.inputFocused,
            passwordError && styles.inputError,
          ]}
        >
          <View style={[styles.iconCircle, pwdFocused && styles.iconCircleFocused]}>
            <Lock
              color={
                passwordError ? authTheme.error : pwdFocused ? authTheme.brand : authTheme.textDim
              }
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
              if (passwordError) setPasswordError(null);
            }}
            secureTextEntry={!showPassword}
            autoComplete="password"
            underlineColorAndroid="transparent"
            returnKeyType="go"
            onSubmitEditing={() => void handleLogin()}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10} style={styles.rightSlot}>
            {showPassword ? (
              <EyeOff color={authTheme.textMuted} size={20} />
            ) : (
              <Eye color={authTheme.textMuted} size={20} />
            )}
          </Pressable>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.rememberInline}>
          <Text style={styles.rememberText}>Remember me</Text>
          <AuthRememberSwitch value={rememberMe} onValueChange={setRememberMe} />
        </View>
        <Pressable onPress={onForgotPassword} hitSlop={8}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
        onPress={() => void handleLogin()}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.submitBtnText}>{isLoading ? '...' : 'SIGN IN WITH PASSWORD'}</Text>
      </TouchableOpacity>
    </>
  );
}
