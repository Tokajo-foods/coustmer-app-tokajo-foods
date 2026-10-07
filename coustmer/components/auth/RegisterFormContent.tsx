import { Pressable } from '@/components/common/Pressable';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import { RegisterFormFields } from '@/components/auth/RegisterFormFields';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { useRegisterSignupFlow } from '@/components/auth/use-register-signup-flow';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  onSignIn?: () => void;
  onRegisterSuccess?: () => void;
};

export function RegisterFormContent({ onSignIn, onRegisterSuccess }: Props) {
  const flow = useRegisterSignupFlow({ onSignIn, onRegisterSuccess });

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
            Email and phone are required. Send and verify an OTP for each before creating your
            account.
          </Text>
        </View>

        {flow.banner ? (
          <View style={styles.bannerWrap}>
            <AuthMessageBanner message={flow.banner.message} type={flow.banner.type} />
          </View>
        ) : null}

        <RegisterFormFields
          values={{
            firstName: flow.firstName,
            lastName: flow.lastName,
            email: flow.email,
            phone: flow.phone,
            password: flow.password,
            confirmPassword: flow.confirmPassword,
            referralCode: flow.referralCode,
          }}
          errors={flow.errors}
          focusedField={flow.focusedField}
          showPassword={flow.showPassword}
          showConfirmPassword={flow.showConfirmPassword}
          emailOtp={flow.emailOtpBlock}
          phoneOtp={flow.phoneOtpBlock}
          setFocusedField={flow.setFocusedField}
          clearFieldError={flow.clearFieldError}
          setShowPassword={flow.setShowPassword}
          setShowConfirmPassword={flow.setShowConfirmPassword}
          onChange={{
            firstName: flow.setFirstName,
            lastName: flow.setLastName,
            email: flow.onChangeEmail,
            phone: flow.onChangePhone,
            password: flow.setPassword,
            confirmPassword: flow.setConfirmPassword,
            referralCode: flow.setReferralCode,
          }}
        />

        <Pressable
          style={[styles.submitBtn, flow.isLoading && styles.submitBtnDisabled]}
          onPress={() => void flow.handleRegister()}
          disabled={flow.isLoading}
        >
          <View style={styles.submitBtnInner}>
            <Text style={styles.submitBtnTextCalm}>
              {flow.isLoading ? 'Creating account…' : 'Create account'}
            </Text>
            {!flow.isLoading ? <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} /> : null}
          </View>
        </Pressable>

        <View style={styles.bottomLinks}>
          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Text style={styles.signupLink} onPress={flow.handleSignIn}>
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
