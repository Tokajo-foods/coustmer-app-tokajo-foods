import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import { LoginModeTabs, type LoginModePref } from '@/components/auth/LoginModeTabs';
import { LoginPasswordSection } from '@/components/auth/LoginPasswordSection';
import { PhoneLoginPanel } from '@/components/auth/PhoneLoginPanel';
import { loginFormStyles } from '@/components/auth/login-form-styles';
import {
  LOGIN_OTP_SECTION_HINT,
  LOGIN_PASSWORD_SECTION_HINT,
  LOGIN_SCREEN_TITLE,
} from '@/lib/auth/auth-form-copy';

type Props = {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: () => void;
  onCreateAccount?: (phone: string) => void;
  initialPhone?: string;
  /** @deprecated use `'otp' | 'password'` — `'phone'` maps to OTP, `'email'` to password */
  initialMode?: LoginModePref | 'phone' | 'email';
};

function resolveInitialMode(mode?: Props['initialMode']): LoginModePref {
  if (mode === 'password' || mode === 'email') return 'password';
  return 'otp';
}

export function LoginFormContent({
  onSignUp,
  onForgotPassword,
  onLoginSuccess,
  onCreateAccount,
  initialPhone,
  initialMode,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<LoginModePref>(() => resolveInitialMode(initialMode));
  const isOtp = mode === 'otp';

  const handleForgotPassword = () =>
    onForgotPassword ? onForgotPassword() : router.push('/(auth)/forgot-password');
  const handleSignUp = () => (onSignUp ? onSignUp() : router.replace('/?auth=sign-up'));

  const subtitle = isOtp ? LOGIN_OTP_SECTION_HINT : LOGIN_PASSWORD_SECTION_HINT;

  return (
    <View style={{ flexShrink: 1 }}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <LoginFormHeader title={LOGIN_SCREEN_TITLE} subtitle={subtitle} />

        <LoginModeTabs value={mode} onChange={setMode} />

        {isOtp ? (
          <PhoneLoginPanel
            initialPhone={initialPhone}
            onLoginSuccess={onLoginSuccess}
            onCreateAccount={onCreateAccount}
          />
        ) : (
          <LoginPasswordSection
            onForgotPassword={handleForgotPassword}
            onLoginSuccess={onLoginSuccess}
          />
        )}

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
