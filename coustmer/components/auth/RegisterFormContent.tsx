import { Pressable } from '@/components/common/Pressable';
import { ArrowRight } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { LoginFormHeader } from '@/components/auth/LoginFormHeader';
import { PhoneOtpStep } from '@/components/auth/PhoneOtpStep';
import { RegisterFormFields } from '@/components/auth/RegisterFormFields';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { useRegisterSignupFlow } from '@/components/auth/use-register-signup-flow';
import { VerifiedPhoneChip } from '@/components/auth/VerifiedPhoneChip';

type Props = {
  initialPhone?: string;
  onSignIn?: () => void;
  onRegisterSuccess?: () => void;
  /** True after mobile OTP — parent expands the bottom sheet for the rest of signup. */
  onDetailsPhaseChange?: (detailsOpen: boolean) => void;
};

export function RegisterFormContent({
  initialPhone,
  onSignIn,
  onRegisterSuccess,
  onDetailsPhaseChange,
}: Props) {
  const flow = useRegisterSignupFlow({ initialPhone, onSignIn, onRegisterSuccess });
  const { otp } = flow;
  const verified = otp.step === 'verified' && Boolean(otp.phone);

  useEffect(() => {
    onDetailsPhaseChange?.(verified);
  }, [verified, onDetailsPhaseChange]);

  return (
    <View style={verified ? { flex: 1, minHeight: 1 } : { flexShrink: 1 }}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={12}
        style={verified ? { flex: 1 } : { flexGrow: 0 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <LoginFormHeader
          compact={!verified}
          title="Create account"
          subtitle={
            verified
              ? 'Almost done — tell us a little about you.'
              : 'Enter your mobile number. We’ll text a 6-digit code to verify it.'
          }
        />

        {!verified ? (
          <>
            <PhoneOtpStep
              compact
              otp={otp}
              onVerify={(code) => void flow.handleVerify(code)}
              verifyLabel="Verify number"
            />
            {otp.step === 'phone' && flow.numberTaken ? (
              <Pressable style={styles.submitBtn} onPress={flow.handleSignIn}>
                <Text style={styles.submitBtnTextCalm}>Sign in instead</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            <VerifiedPhoneChip
              phone={otp.phone!}
              onChange={flow.changeNumber}
              disabled={flow.submitting}
            />

            {flow.banner ? (
              <View style={styles.bannerWrap}>
                <AuthMessageBanner message={flow.banner} type="error" />
              </View>
            ) : null}

            {flow.alreadyRegistered ? (
              <Pressable
                style={[styles.submitBtn, flow.submitting && styles.submitBtnDisabled]}
                onPress={() => void flow.signInWithVerifiedPhone()}
                disabled={flow.submitting}
              >
                <Text style={styles.submitBtnTextCalm}>
                  {flow.submitting ? 'Signing in…' : 'Sign in with this number'}
                </Text>
              </Pressable>
            ) : (
              <>
                <RegisterFormFields
                  values={flow.values}
                  errors={flow.errors}
                  onChange={flow.setField}
                  editable={!flow.submitting}
                  emailOtp={flow.emailOtp}
                />
                <Pressable
                  style={[styles.submitBtn, flow.submitting && styles.submitBtnDisabled]}
                  onPress={() => void flow.handleRegister()}
                  disabled={flow.submitting}
                >
                  <View style={styles.submitBtnInner}>
                    <Text style={styles.submitBtnTextCalm}>
                      {flow.submitting ? 'Creating account…' : 'Create account'}
                    </Text>
                    {!flow.submitting ? (
                      <ArrowRight color="#FFFFFF" size={18} strokeWidth={2.4} />
                    ) : null}
                  </View>
                </Pressable>
              </>
            )}
          </>
        )}

        <View style={[styles.bottomLinks, !verified && styles.bottomLinksCompact]}>
          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Text style={styles.signupLink} onPress={flow.handleSignIn}>
              Sign in
            </Text>
          </Text>
        </View>

        <Text style={[styles.terms, !verified && styles.termsCompact]}>
          By signing up, you agree to our <Text style={styles.termsLink}>Terms</Text> &{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
}
