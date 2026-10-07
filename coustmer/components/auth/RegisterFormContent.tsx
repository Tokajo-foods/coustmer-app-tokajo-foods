import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import { RegisterFormFields } from '@/components/auth/RegisterFormFields';
import {
  mapRegisterApiError,
  type RegisterFieldKey,
  type RegisterFocusField,
} from '@/components/auth/register-form-helpers';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { authTheme } from '@/constants/auth-theme';
import { useAuthStore } from '@/store/auth-store';
import {
  validateConfirmPassword,
  validateEmail,
  validateIndianPhone,
  validateName,
  validateOptionalName,
  validatePassword,
} from '@/utils/validation';

type Props = {
  onSignIn?: () => void;
  onRegisterSuccess?: () => void;
};

export function RegisterFormContent({ onSignIn, onRegisterSuccess }: Props) {
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

  const handleRegister = async () => {
    const nextErrors = {
      firstName: validateName(firstName, 'First name'),
      lastName: validateOptionalName(lastName, 'Last name'),
      email: validateEmail(email),
      phone: phone.trim() ? validateIndianPhone(phone) : null,
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
        phone: phone.trim() || undefined,
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
        setBanner(null);
        return;
      }

      setBanner({ message, type: 'error' });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={24}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <LoginFormHeader
          title="Create account"
          subtitle="Join Tokajo for faster checkout and order tracking."
        />

        <View style={styles.tipRow}>
          <View style={styles.tipIcon}>
            <Sparkles color={authTheme.brand} size={16} strokeWidth={2.2} />
          </View>
          <Text style={styles.tipText}>
            Email and password are required. Phone and referral code are optional.
          </Text>
        </View>

        {banner ? (
          <View style={styles.bannerWrap}>
            <AuthMessageBanner message={banner.message} type={banner.type} />
          </View>
        ) : null}

        <RegisterFormFields
          values={{
            firstName,
            lastName,
            email,
            phone,
            password,
            confirmPassword,
            referralCode,
          }}
          errors={errors}
          focusedField={focusedField}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          setFocusedField={setFocusedField}
          clearFieldError={clearFieldError}
          setShowPassword={setShowPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          onChange={{
            firstName: setFirstName,
            lastName: setLastName,
            email: setEmail,
            phone: setPhone,
            password: setPassword,
            confirmPassword: setConfirmPassword,
            referralCode: setReferralCode,
          }}
        />

        <Pressable
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={() => void handleRegister()}
          disabled={isLoading}
        >
          <View style={styles.submitBtnInner}>
            <Text style={styles.submitBtnTextCalm}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </Text>
            {!isLoading ? <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} /> : null}
          </View>
        </Pressable>

        <View style={styles.bottomLinks}>
          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Text style={styles.signupLink} onPress={handleSignIn}>
              Sign in
            </Text>
          </Text>
        </View>

        <Text style={styles.terms}>
          By signing up, you agree to our <Text style={styles.termsLink}>Terms</Text> &{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
}
