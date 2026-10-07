import { Pressable } from '@/components/common/Pressable';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import {
  RegisterEmailStep,
  RegisterOtpStep,
  RegisterPhoneStep,
} from '@/components/auth/RegisterContactSteps';
import { RegisterFormFields } from '@/components/auth/RegisterFormFields';
import { RegisterFormProgress } from '@/components/auth/RegisterFormProgress';
import { maskEmail, maskPhone } from '@/components/auth/register-form-helpers';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { useRegisterSignupFlow } from '@/components/auth/use-register-signup-flow';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  onSignIn?: () => void;
  onRegisterSuccess?: () => void;
};

export function RegisterFormContent({ onSignIn, onRegisterSuccess }: Props) {
  const flow = useRegisterSignupFlow({ onSignIn, onRegisterSuccess });

  const title =
    flow.step === 'email'
      ? 'Create account'
      : flow.step === 'email_otp'
        ? 'Verify email'
        : flow.step === 'phone'
          ? 'Add phone number'
          : flow.step === 'phone_otp'
            ? 'Verify phone'
            : 'Finish signup';

  const subtitle =
    flow.step === 'email'
      ? 'Verify your email, then your phone, then set your password.'
      : flow.step === 'email_otp'
        ? `Enter the 6-digit code sent to ${maskEmail(flow.email)}.`
        : flow.step === 'phone'
          ? 'Email verified. Confirm your mobile number next.'
          : flow.step === 'phone_otp'
            ? `Enter the SMS code sent to ${maskPhone(flow.phone)}.`
            : `${maskEmail(flow.email)} · ${maskPhone(flow.phone)}`;

  const chrome = {
    focused: flow.focusedField,
    fieldError: flow.fieldError,
    setFocused: flow.setFocusedField as (k: string | null) => void,
    clearError: flow.clearError,
    isLoading: flow.isLoading,
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
        <LoginFormHeader title={title} subtitle={subtitle} />
        <RegisterFormProgress step={flow.step} />

        {flow.step === 'email' ? (
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Sparkles color={authTheme.brand} size={16} strokeWidth={2.2} />
            </View>
            <Text style={styles.tipText}>
              Both email and phone are required. Each is verified with a one-time code.
            </Text>
          </View>
        ) : null}

        {flow.banner ? (
          <View style={styles.bannerWrap}>
            <AuthMessageBanner message={flow.banner.message} type={flow.banner.type} />
          </View>
        ) : null}

        {flow.step === 'email' ? (
          <RegisterEmailStep
            {...chrome}
            email={flow.email}
            setEmail={flow.setEmail}
            onSubmit={() => void flow.sendEmailOtp()}
          />
        ) : null}

        {flow.step === 'email_otp' ? (
          <RegisterOtpStep
            {...chrome}
            otp={flow.otp}
            setOtp={flow.setOtp}
            channel="email"
            onSubmit={() => void flow.verifyEmailOtp()}
            onResend={() => void flow.resend()}
          />
        ) : null}

        {flow.step === 'phone' ? (
          <RegisterPhoneStep
            {...chrome}
            phone={flow.phone}
            setPhone={flow.setPhone}
            onSubmit={() => void flow.sendPhoneOtp()}
          />
        ) : null}

        {flow.step === 'phone_otp' ? (
          <RegisterOtpStep
            {...chrome}
            otp={flow.otp}
            setOtp={flow.setOtp}
            channel="phone"
            onSubmit={() => void flow.verifyPhoneOtp()}
            onResend={() => void flow.resend()}
          />
        ) : null}

        {flow.step === 'details' ? (
          <>
            <RegisterFormFields
              values={{
                firstName: flow.firstName,
                lastName: flow.lastName,
                password: flow.password,
                confirmPassword: flow.confirmPassword,
                referralCode: flow.referralCode,
              }}
              errors={flow.errors}
              focusedField={flow.focusedField}
              showPassword={flow.showPassword}
              showConfirmPassword={flow.showConfirmPassword}
              setFocusedField={flow.setFocusedField}
              clearFieldError={flow.clearFieldError}
              setShowPassword={flow.setShowPassword}
              setShowConfirmPassword={flow.setShowConfirmPassword}
              onChange={{
                firstName: flow.setFirstName,
                lastName: flow.setLastName,
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
                {!flow.isLoading ? (
                  <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} />
                ) : null}
              </View>
            </Pressable>
          </>
        ) : null}

        <View style={styles.bottomLinks}>
          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Text style={styles.signupLink} onPress={flow.handleSignIn}>
              Sign in
            </Text>
          </Text>
        </View>

        {flow.step === 'details' ? (
          <Text style={styles.terms}>
            By signing up, you agree to our <Text style={styles.termsLink}>Terms</Text> &{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
}
