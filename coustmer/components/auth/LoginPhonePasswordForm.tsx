import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { AuthRememberSwitch } from '@/components/auth/AuthRememberSwitch';
import { loginFormStyles as styles } from '@/components/auth/login-form-styles';
import { PhoneNumberInput } from '@/components/auth/PhoneNumberInput';
import { authTheme } from '@/constants/auth-theme';
import { useAuthStore } from '@/store/auth-store';
import { isValidIndianPhone, normalizeIndianPhoneInput, validateLoginPassword } from '@/utils/validation';

type FocusField = 'password' | null;

type Props = {
  initialPhone?: string;
  onForgotPassword: () => void;
  onLoginSuccess?: () => void;
};

function localDigitsToE164(local: string): string {
  const digits = local.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return '';
  return normalizeIndianPhoneInput(`+91${digits}`);
}

function validatePhoneLocal(local: string): string | null {
  const e164 = localDigitsToE164(local);
  if (!e164) return 'Enter your 10-digit mobile number';
  if (!isValidIndianPhone(e164)) return 'Enter a valid Indian mobile number';
  return null;
}

export function LoginPhonePasswordForm({
  initialPhone,
  onForgotPassword,
  onLoginSuccess,
}: Props) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [phoneLocal, setPhoneLocal] = useState(() =>
    initialPhone ? initialPhone.replace(/^\+91/, '').replace(/\D/g, '').slice(-10) : '',
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [errors, setErrors] = useState<{ phone?: string | null; password?: string | null }>({});
  const [banner, setBanner] = useState<string | null>(null);

  const handleLogin = async () => {
    const nextErrors = {
      phone: validatePhoneLocal(phoneLocal),
      password: validateLoginPassword(password),
    };
    setErrors(nextErrors);
    setBanner(null);
    if (Object.values(nextErrors).some(Boolean)) return;

    const phone = localDigitsToE164(phoneLocal);
    try {
      await login({ phone, password });
      onLoginSuccess?.();
      router.replace('/home');
    } catch (error) {
      setBanner(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const inputStyle = (hasError: boolean) => [
    styles.inputContainer,
    focusedField === 'password' && styles.inputFocused,
    hasError && styles.inputError,
  ];

  const iconColor = (hasError: boolean) => {
    if (hasError) return authTheme.error;
    if (focusedField === 'password') return authTheme.brand;
    return authTheme.textDim;
  };

  return (
    <>
      {banner ? <AuthMessageBanner message={banner} type="error" /> : null}

      <PhoneNumberInput
        value={phoneLocal}
        onChangeText={(text) => {
          setPhoneLocal(text);
          if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
        }}
        onSubmit={() => void handleLogin()}
        error={errors.phone}
      />

      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Password</Text>
        <View style={inputStyle(Boolean(errors.password))}>
          <View style={[styles.iconCircle, focusedField === 'password' && styles.iconCircleFocused]}>
            <Lock color={iconColor(Boolean(errors.password))} size={18} strokeWidth={2} />
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
