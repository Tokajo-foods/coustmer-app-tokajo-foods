import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { LoginEmailForm } from '@/components/auth/LoginEmailForm';
import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import { LoginModeTabs, type LoginModePref } from '@/components/auth/LoginModeTabs';
import { loginFormStyles } from '@/components/auth/login-form-styles';
import { PhoneLoginPanel } from '@/components/auth/PhoneLoginPanel';

type Props = {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: () => void;
  /** Phone verified but no account yet → sign-up carrying that number. */
  onCreateAccount?: (phone: string) => void;
  initialMode?: LoginModePref;
  initialPhone?: string;
};

export function LoginFormContent({
  onSignUp,
  onForgotPassword,
  onLoginSuccess,
  onCreateAccount,
  initialMode,
  initialPhone,
}: Props) {
  const router = useRouter();
  const [pref, setPref] = useState<LoginModePref>(initialMode ?? 'phone');
  const isPhone = pref === 'phone';

  const handleForgotPassword = () =>
    onForgotPassword ? onForgotPassword() : router.replace('/?auth=forgot-password');
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
          title={isPhone ? 'Sign in with phone' : 'Welcome back'}
          subtitle={
            isPhone
              ? 'Verify your mobile number with a one-time code.'
              : 'Sign in with your email and password.'
          }
        />

        <LoginModeTabs value={pref} onChange={setPref} />

        {isPhone ? (
          <PhoneLoginPanel
            initialPhone={initialPhone}
            onLoginSuccess={onLoginSuccess}
            onCreateAccount={onCreateAccount}
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
