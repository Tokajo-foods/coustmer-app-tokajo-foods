import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import { PhoneOtpStep } from '@/components/auth/PhoneOtpStep';
import { useFirebasePhoneOtp } from '@/components/auth/use-firebase-phone-otp';
import { VerifiedPhoneChip } from '@/components/auth/VerifiedPhoneChip';
import { getAuthErrorCode } from '@/lib/auth/http';
import { describePhoneAuthError, PHONE_REVERIFY_CODES } from '@/lib/auth/phone-auth-errors';
import { precheckPhone } from '@/lib/auth/phone-precheck';
import { useAuthStore } from '@/store/auth-store';

type Props = {
  initialPhone?: string;
  onLoginSuccess?: () => void;
  /** USER_NOT_FOUND → sign-up with the already verified number. */
  onCreateAccount?: (phone: string) => void;
};

type Failure = { message: string; notFound: boolean };

const NO_CUSTOMER_ACCOUNT = new Set(['USER_NOT_FOUND', 'ACCOUNT_NOT_FOUND', 'ROLE_NOT_ALLOWED']);

export function PhoneLoginPanel({ initialPhone, onLoginSuccess, onCreateAccount }: Props) {
  const router = useRouter();
  const [unknownPhone, setUnknownPhone] = useState<string | null>(null);
  const otp = useFirebasePhoneOtp({
    initialPhone,
    precheck: async (phone) => {
      const miss = await precheckPhone(phone, 'login');
      setUnknownPhone(miss?.code && NO_CUSTOMER_ACCOUNT.has(miss.code) ? phone : null);
      return miss?.message ?? null;
    },
  });
  const loginWithPhone = useAuthStore((s) => s.loginWithPhone);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  const submit = async (idToken: string, phone: string) => {
    setSubmitting(true);
    setFailure(null);
    try {
      await loginWithPhone({ idToken, phone });
      onLoginSuccess?.();
      router.replace('/home');
    } catch (error) {
      const code = getAuthErrorCode(error);
      const message = describePhoneAuthError(error, 'Sign in failed. Try again.');
      if (code && PHONE_REVERIFY_CODES.has(code)) {
        otp.requireReverify(message);
        return;
      }
      setFailure({ message, notFound: Boolean(code && NO_CUSTOMER_ACCOUNT.has(code)) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (code: string) => {
    if (submitting || otp.verifying) return;
    setFailure(null);
    const verified = await otp.verify(code);
    if (verified) await submit(verified.idToken, verified.phone);
  };

  const retry = async () => {
    if (!otp.phone) return;
    const token = await otp.getIdTokenForSubmit();
    if (token) await submit(token, otp.phone);
  };

  const changeNumber = () => {
    setFailure(null);
    otp.changeNumber();
  };

  if (otp.step !== 'verified' || !otp.phone) {
    return (
      <>
        <PhoneOtpStep
          otp={otp}
          onVerify={(code) => void handleVerify(code)}
          submitting={submitting}
          phoneTip="We’ll text a 6-digit code to sign you in. No password needed."
          verifyLabel="Verify & sign in"
        />
        {otp.step === 'phone' && otp.phoneError && unknownPhone && onCreateAccount ? (
          <Pressable style={styles.submitBtn} onPress={() => onCreateAccount(unknownPhone)}>
            <Text style={styles.submitBtnTextCalm}>Create account with this number</Text>
          </Pressable>
        ) : null}
      </>
    );
  }

  const phone = otp.phone;
  return (
    <>
      <VerifiedPhoneChip phone={phone} onChange={changeNumber} disabled={submitting} />
      {failure ? (
        <AuthMessageBanner
          message={
            failure.notFound
              ? 'No account for this number. Create one in a few seconds — your number is already verified.'
              : failure.message
          }
          type="error"
        />
      ) : null}
      {failure?.notFound && onCreateAccount ? (
        <Pressable style={styles.submitBtn} onPress={() => onCreateAccount(phone)}>
          <Text style={styles.submitBtnTextCalm}>Create account</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={() => void retry()}
          disabled={submitting}
        >
          <Text style={styles.submitBtnTextCalm}>
            {submitting ? 'Signing in…' : failure ? 'Try again' : 'Continue'}
          </Text>
        </Pressable>
      )}
      <View style={styles.resendRow}>
        <Text style={styles.resendLink} onPress={submitting ? undefined : changeNumber}>
          Use a different number
        </Text>
      </View>
    </>
  );
}
