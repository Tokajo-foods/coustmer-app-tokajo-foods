import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import { LoginPasswordSection } from '@/components/auth/LoginPasswordSection';
import { PhoneLoginPanel } from '@/components/auth/PhoneLoginPanel';
import { loginFormStyles } from '@/components/auth/login-form-styles';
import {
  LOGIN_OTP_SECTION_HINT,
  LOGIN_OTP_SECTION_TITLE,
  LOGIN_PASSWORD_SECTION_HINT,
  LOGIN_PASSWORD_SECTION_TITLE,
  LOGIN_SCREEN_SUBTITLE,
  LOGIN_SCREEN_TITLE,
} from '@/lib/auth/auth-form-copy';

type Props = {
  onSignUp?: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: () => void;
  onCreateAccount?: (phone: string) => void;
  initialPhone?: string;
};

export function LoginFormContent({
  onSignUp,
  onForgotPassword,
  onLoginSuccess,
  onCreateAccount,
  initialPhone,
}: Props) {
  const router = useRouter();

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
        <LoginFormHeader title={LOGIN_SCREEN_TITLE} subtitle={LOGIN_SCREEN_SUBTITLE} />

        <Text style={styles.authSectionLabel}>{LOGIN_OTP_SECTION_TITLE}</Text>
        <Text style={styles.authSectionHint}>{LOGIN_OTP_SECTION_HINT}</Text>
        <PhoneLoginPanel
          initialPhone={initialPhone}
          onLoginSuccess={onLoginSuccess}
          onCreateAccount={onCreateAccount}
        />

        <View style={styles.authSectionDivider} />

        <Text style={styles.authSectionLabel}>{LOGIN_PASSWORD_SECTION_TITLE}</Text>
        <Text style={styles.authSectionHint}>{LOGIN_PASSWORD_SECTION_HINT}</Text>
        <LoginPasswordSection
          onForgotPassword={handleForgotPassword}
          onLoginSuccess={onLoginSuccess}
        />

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
