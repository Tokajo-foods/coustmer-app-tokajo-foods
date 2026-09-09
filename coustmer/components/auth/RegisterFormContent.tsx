import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Gift, Lock, Mail, Phone, User } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView,
  Platform,
  
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { loginFormStyles } from '@/components/auth/LoginFormContent';
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

type FocusField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword'
  | 'referralCode'
  | null;

type FieldKey = Exclude<FocusField, null>;

type Props = {
  onSignIn?: () => void;
  onRegisterSuccess?: () => void;
};

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={registerStyles.sectionRow}>
      <Text style={registerStyles.sectionLabel}>{children}</Text>
      <View style={registerStyles.sectionLine} />
    </View>
  );
}

function mapRegisterApiError(message: string): { field?: FieldKey; message: string } {
  const lower = message.toLowerCase();

  if (
    lower.includes('confirm') ||
    lower.includes('match') ||
    lower.includes('re-enter')
  ) {
    return { field: 'confirmPassword', message };
  }
  if (
    lower.includes('password') ||
    lower.includes('digit') ||
    lower.includes('uppercase') ||
    lower.includes('special') ||
    lower.includes('character')
  ) {
    return { field: 'password', message };
  }
  if (lower.includes('email')) return { field: 'email', message };
  if (lower.includes('phone')) return { field: 'phone', message };
  if (lower.includes('first name') || lower.includes('firstname')) {
    return { field: 'firstName', message };
  }
  if (lower.includes('last name') || lower.includes('lastname')) {
    return { field: 'lastName', message };
  }
  if (lower.includes('referral')) {
    return { field: 'referralCode', message };
  }

  return { message };
}

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
  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [banner, setBanner] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

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

  const clearFieldError = (field: FieldKey) => {
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

  const renderInput = (
    field: FieldKey,
    {
      icon: Icon,
      placeholder,
      value,
      onChangeText,
      error,
      secureTextEntry,
      keyboardType,
      autoCapitalize,
      maxLength,
      returnKeyType,
      textContentType,
      rightElement,
    }: {
      icon: typeof User;
      placeholder: string;
      value: string;
      onChangeText: (text: string) => void;
      error?: string | null;
      secureTextEntry?: boolean;
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      autoCapitalize?: 'none' | 'words';
      maxLength?: number;
      returnKeyType?: 'next' | 'done';
      textContentType?: 'none' | 'oneTimeCode';
      rightElement?: ReactNode;
    },
  ) => (
    <View style={styles.fieldWrap}>
      <View style={inputStyle(field, Boolean(error))}>
        <View style={[styles.iconCircle, focusedField === field && styles.iconCircleFocused]}>
          <Icon color={iconColor(field, Boolean(error))} size={18} strokeWidth={2} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={authTheme.textDim}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            clearFieldError(field);
          }}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
          autoComplete="off"
          textContentType={textContentType ?? 'none'}
          importantForAutofill="no"
          returnKeyType={returnKeyType}
          maxLength={maxLength}
          underlineColorAndroid="transparent"
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
        />
        {rightElement ? <View style={styles.rightSlot}>{rightElement}</View> : null}
      </View>
      {error ? (
        <Text style={styles.errorText} numberOfLines={3}>
          {error}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={20}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join 50,000+ food lovers. Fast delivery, top restaurants.</Text>

        {banner ? (
          <View style={registerStyles.bannerWrap}>
            <AuthMessageBanner message={banner.message} type={banner.type} />
          </View>
        ) : null}

        <SectionLabel>About you</SectionLabel>
        <View style={registerStyles.row}>
          <View style={registerStyles.half}>
            {renderInput('firstName', {
              icon: User,
              placeholder: 'First name',
              value: firstName,
              onChangeText: setFirstName,
              error: errors.firstName,
              autoCapitalize: 'words',
              returnKeyType: 'next',
            })}
          </View>
          <View style={registerStyles.half}>
            {renderInput('lastName', {
              icon: User,
              placeholder: 'Last name',
              value: lastName,
              onChangeText: setLastName,
              error: errors.lastName,
              autoCapitalize: 'words',
              returnKeyType: 'next',
            })}
          </View>
        </View>

        <SectionLabel>Contact</SectionLabel>
        {renderInput('email', {
          icon: Mail,
          placeholder: 'Email address',
          value: email,
          onChangeText: setEmail,
          error: errors.email,
          keyboardType: 'email-address',
          returnKeyType: 'next',
        })}
        {renderInput('phone', {
          icon: Phone,
          placeholder: 'Phone number',
          value: phone,
          onChangeText: setPhone,
          error: errors.phone,
          keyboardType: 'phone-pad',
          maxLength: 15,
          returnKeyType: 'next',
        })}
        {!errors.phone ? (
          <Text style={registerStyles.hint}>Optional. Add +91 before your 10-digit number.</Text>
        ) : null}

        <SectionLabel>Security</SectionLabel>
        {renderInput('password', {
          icon: Lock,
          placeholder: 'Min 8 chars, uppercase & symbol',
          value: password,
          onChangeText: setPassword,
          error: errors.password,
          secureTextEntry: !showPassword,
          returnKeyType: 'next',
          textContentType: 'oneTimeCode',
          rightElement: (
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
              {showPassword ? (
                <EyeOff color={authTheme.textMuted} size={20} />
              ) : (
                <Eye color={authTheme.textMuted} size={20} />
              )}
            </Pressable>
          ),
        })}
        {renderInput('confirmPassword', {
          icon: Lock,
          placeholder: 'Confirm password',
          value: confirmPassword,
          onChangeText: setConfirmPassword,
          error: errors.confirmPassword,
          secureTextEntry: !showConfirmPassword,
          returnKeyType: 'done',
          textContentType: 'oneTimeCode',
          rightElement: (
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={10}>
              {showConfirmPassword ? (
                <EyeOff color={authTheme.textMuted} size={20} />
              ) : (
                <Eye color={authTheme.textMuted} size={20} />
              )}
            </Pressable>
          ),
        })}

        <SectionLabel>Referral (optional)</SectionLabel>
        {renderInput('referralCode', {
          icon: Gift,
          placeholder: 'Friend’s referral code',
          value: referralCode,
          onChangeText: (t) => setReferralCode(t.toUpperCase()),
          error: errors.referralCode,
          autoCapitalize: 'characters',
          maxLength: 20,
          returnKeyType: 'done',
        })}
        {!errors.referralCode ? (
          <Text style={registerStyles.hint}>
            Have a code? You and your friend both get wallet credit once.
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>{isLoading ? '...' : 'SIGN UP'}</Text>
        </TouchableOpacity>

        <View style={styles.bottomLinks}>
          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Text style={styles.signupLink} onPress={handleSignIn}>
              Sign in
            </Text>
          </Text>
        </View>

        <Text style={registerStyles.terms}>
          By signing up, you agree to our <Text style={registerStyles.termsLink}>Terms</Text> &{' '}
          <Text style={registerStyles.termsLink}>Privacy Policy</Text>
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = loginFormStyles;

const registerStyles = StyleSheet.create({
  bannerWrap: {
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: authTheme.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: authTheme.brandMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  hint: {
    color: authTheme.textDim,
    fontSize: 11,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 2,
    lineHeight: 16,
  },
  terms: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: authTheme.textDim,
    paddingHorizontal: 12,
    marginTop: 24,
  },
  termsLink: {
    color: authTheme.brand,
    fontWeight: '700',
  },
});
