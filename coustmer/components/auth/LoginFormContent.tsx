import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { LOGIN_EMAIL_SUBTITLE, LOGIN_PHONE_SUBTITLE } from '@/lib/auth/auth-form-copy';
import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import { LoginEmailForm } from '@/components/auth/LoginEmailForm';
import { LoginModeTabs, type LoginModePref } from '@/components/auth/LoginModeTabs';
import { LoginPhonePasswordForm } from '@/components/auth/LoginPhonePasswordForm';
import { loginFormStyles } from '@/components/auth/login-form-styles';

type Props = {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: () => void;
  initialMode?: LoginModePref;
  initialPhone?: string;
};

export function LoginFormContent({
  onSignUp,
  onForgotPassword,
  onLoginSuccess,
  initialMode,
  initialPhone,
}: Props) {
  const router = useRouter();
  const [pref, setPref] = useState<LoginModePref>(initialMode ?? 'phone');
  const isPhone = pref === 'phone';

  const handleForgotPassword = () =>
    onForgotPassword ? onForgotPassword() : router.push('/(auth)/forgot-password');
  const handleSignUp = () => (onSignUp ? onSignUp() : router.replace('/?auth=sign-up'));

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
        <LoginFormHeader
          title={isPhone ? 'Sign in with phone' : 'Sign in with email'}
          subtitle={isPhone ? LOGIN_PHONE_SUBTITLE : LOGIN_EMAIL_SUBTITLE}
        />

        <LoginModeTabs value={pref} onChange={setPref} />

        {isPhone ? (
          <LoginPhonePasswordForm
            initialPhone={initialPhone}
            onForgotPassword={handleForgotPassword}
            onLoginSuccess={onLoginSuccess}
          />
        ) : (
          <LoginEmailForm onForgotPassword={handleForgotPassword} onLoginSuccess={onLoginSuccess} />
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
