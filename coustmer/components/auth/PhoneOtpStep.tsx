import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { MessageSquareText, Smartphone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import { OtpCodeInput } from '@/components/auth/OtpCodeInput';
import { PhoneNumberInput } from '@/components/auth/PhoneNumberInput';
import type { FirebasePhoneOtp } from '@/components/auth/use-firebase-phone-otp';
import { formatOtpClock } from '@/components/auth/use-otp-countdown';
import { authTheme } from '@/constants/auth-theme';
import { formatPhoneForDisplay } from '@/lib/auth/phone-number';

type Props = {
  otp: FirebasePhoneOtp;
  /** Called with the 6-digit code (button or auto-submit). Screen runs otp.verify + backend. */
  onVerify: (code: string) => void;
  /** Backend call in flight after Firebase verify. */
  submitting?: boolean;
  phoneTip?: string;
  sendLabel?: string;
  verifyLabel?: string;
};

/** Phone entry → Firebase SMS → 6-digit code. Hosts the reCAPTCHA verifier. */
export function PhoneOtpStep({
  otp,
  onVerify,
  submitting = false,
  phoneTip = 'We’ll text a 6-digit code to verify this number.',
  sendLabel = 'Send OTP',
  verifyLabel = 'Verify & continue',
}: Props) {
  const busy = otp.sending || otp.verifying || submitting;
  const blocked = Boolean(otp.blockedReason);

  return (
    <>
      {otp.clientReady ? (
        <FirebaseRecaptchaVerifierModal
          ref={otp.recaptchaRef}
          firebaseConfig={otp.firebaseConfig}
          attemptInvisibleVerification
          title="Quick security check"
          cancelLabel="Cancel"
        />
      ) : null}

      {otp.blockedReason ? <AuthMessageBanner message={otp.blockedReason} type="error" /> : null}
      {otp.error ? <AuthMessageBanner message={otp.error} type="error" /> : null}

      {otp.step === 'phone' ? (
        <>
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Smartphone color={authTheme.brand} size={16} strokeWidth={2.2} />
            </View>
            <Text style={styles.tipText}>{phoneTip}</Text>
          </View>
          <PhoneNumberInput
            value={otp.phoneInput}
            onChangeText={otp.setPhoneInput}
            onSubmit={() => void otp.send()}
            error={otp.phoneError}
            editable={!busy}
          />
          <Pressable
            style={[styles.submitBtn, (busy || blocked) && styles.submitBtnDisabled]}
            onPress={() => void otp.send()}
            disabled={busy || blocked}
            accessibilityRole="button"
          >
            <Text style={styles.submitBtnTextCalm}>{otp.sending ? 'Sending OTP…' : sendLabel}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <MessageSquareText color={authTheme.brand} size={16} strokeWidth={2.2} />
            </View>
            <Text style={styles.tipText}>
              Code sent to{' '}
              <Text style={styles.emailHighlight}>
                {otp.phone ? formatPhoneForDisplay(otp.phone) : ''}
              </Text>
              .{' '}
              <Text style={styles.resendLink} onPress={busy ? undefined : otp.changeNumber}>
                Change number
              </Text>
            </Text>
          </View>
          <OtpCodeInput
            value={otp.code}
            onChange={otp.setCode}
            onComplete={onVerify}
            error={otp.codeError}
            disabled={busy || !otp.canVerify}
          />
          <Pressable
            style={[styles.submitBtn, (busy || !otp.canVerify) && styles.submitBtnDisabled]}
            onPress={() => onVerify(otp.code)}
            disabled={busy || !otp.canVerify}
            accessibilityRole="button"
          >
            <Text style={styles.submitBtnTextCalm}>
              {otp.verifying ? 'Verifying…' : submitting ? 'Please wait…' : verifyLabel}
            </Text>
          </Pressable>
          <View style={styles.resendRow}>
            {otp.canResend ? (
              <Text style={styles.resendMuted}>
                {otp.canVerify ? 'Didn’t get it? ' : ''}
                <Text style={styles.resendLink} onPress={() => void otp.resendCode()}>
                  {otp.canVerify ? 'Resend code' : 'Send a new code'}
                </Text>
              </Text>
            ) : (
              <Text style={styles.resendMuted}>
                {otp.sending
                  ? 'Sending a new code…'
                  : `Resend code in ${formatOtpClock(otp.resendSecondsLeft)}`}
              </Text>
            )}
          </View>
        </>
      )}
    </>
  );
}
