import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { AuthRememberSwitch } from '@/components/auth/AuthRememberSwitch';
import { loginFormStyles as styles } from '@/components/auth/login-form-styles';
import { authTheme } from '@/constants/auth-theme';
import { AUTH_EMAIL_PLACEHOLDER } from '@/lib/auth/auth-form-copy';
import { useAuthStore } from '@/store/auth-store';
import { validateEmail, validateLoginPassword } from '@/utils/validation';

type FocusField = 'email' | 'password' | null;

type Props = {
  onForgotPassword: () => void;
  onLoginSuccess?: () => void;
};

export function LoginEmailForm({ onForgotPassword, onLoginSuccess }: Props) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const handleLogin = async () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validateLoginPassword(password),
    };
    setErrors(nextErrors);
    setBanner(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    try {
      await login({ email: email.trim().toLowerCase(), password });
      onLoginSuccess?.();
      router.replace('/home');
    } catch (error) {
      setBanner(error instanceof Error ? error.message : 'Login failed');
    }
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
    <>
      {banner ? <AuthMessageBanner message={banner} type="error" /> : null}

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Email address</Text>
        <View style={inputStyle('email', Boolean(errors.email))}>
          <View style={[styles.iconCircle, focusedField === 'email' && styles.iconCircleFocused]}>
            <Mail color={iconColor('email', Boolean(errors.email))} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder={AUTH_EMAIL_PLACEHOLDER}
            placeholderTextColor={authTheme.textDim}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            underlineColorAndroid="transparent"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Password</Text>
        <View style={inputStyle('password', Boolean(errors.password))}>
          <View style={[styles.iconCircle, focusedField === 'password' && styles.iconCircleFocused]}>
            <Lock color={iconColor('password', Boolean(errors.password))} size={18} strokeWidth={2} />
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
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
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
        <Text style={styles.submitBtnText}>{isLoading ? '...' : 'SIGN IN'}</Text>
      </TouchableOpacity>
    </>
  );
}
