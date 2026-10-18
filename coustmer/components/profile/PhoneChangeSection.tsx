import { BadgeCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { forgotPasswordStyles as otpStyles } from '@/components/auth/forgot-password-styles';
import { PhoneOtpStep } from '@/components/auth/PhoneOtpStep';
import { VerifiedPhoneChip } from '@/components/auth/VerifiedPhoneChip';
import { usePhoneChangeFlow } from '@/components/profile/use-phone-change-flow';
import { authTheme } from '@/constants/auth-theme';
import { formatPhoneForDisplay } from '@/lib/auth/phone-number';

type Props = {
  currentPhone?: string | null;
  onDone: () => void;
};

/** Old number OTP → new number OTP → "Phone number updated". */
export function PhoneChangeSection({ currentPhone, onDone }: Props) {
  const flow = usePhoneChangeFlow(currentPhone);

  if (flow.stage === 'done') {
    return (
      <View style={styles.doneCard}>
        <BadgeCheck color={authTheme.success} size={40} strokeWidth={2} />
        <Text style={styles.doneTitle}>Phone number updated</Text>
        <Text style={styles.doneBody}>
          Your login number is now{' '}
          <Text style={styles.doneStrong}>
            {flow.savedPhone ? formatPhoneForDisplay(flow.savedPhone) : 'saved'}
          </Text>
          . Other devices were signed out for your security.
        </Text>
        <Pressable style={otpStyles.submitBtn} onPress={onDone}>
          <Text style={otpStyles.submitBtnTextCalm}>Done</Text>
        </Pressable>
      </View>
    );
  }

  const isCurrent = flow.stage === 'current';
  const otp = isCurrent ? flow.currentOtp : flow.newOtp;

  return (
    <View>
      <Text style={styles.stepLabel}>
        {isCurrent ? 'Step 1 of 2 · Verify your current number' : flow.currentPhone ? 'Step 2 of 2 · Verify your new number' : 'Add your phone number'}
      </Text>
      {flow.banner ? <AuthMessageBanner message={flow.banner} type="error" /> : null}

      {otp.step === 'verified' && otp.phone ? (
        <>
          <VerifiedPhoneChip phone={otp.phone} />
          <Pressable
            style={[otpStyles.submitBtn, flow.saving && otpStyles.submitBtnDisabled]}
            disabled={flow.saving}
            onPress={() =>
              void (isCurrent ? flow.continueWithVerifiedCurrent() : flow.continueWithVerifiedNew())
            }
          >
            <Text style={otpStyles.submitBtnTextCalm}>
              {flow.saving ? 'Please wait…' : isCurrent ? 'Continue' : 'Save new number'}
            </Text>
          </Pressable>
        </>
      ) : (
        <PhoneOtpStep
          key={flow.stage}
          otp={otp}
          lockPhone={isCurrent}
          submitting={flow.saving}
          onVerify={(code) => void (isCurrent ? flow.verifyCurrentCode(code) : flow.verifyNewCode(code))}
          phoneTip={
            isCurrent
              ? 'First confirm it’s you. We’ll text a code to the number on your account.'
              : 'Enter the new mobile number. We’ll text a code to verify it.'
          }
          sendLabel={isCurrent ? 'Send OTP to current number' : 'Send OTP to new number'}
          verifyLabel={isCurrent ? 'Verify current number' : 'Verify & save new number'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepLabel: {
    color: authTheme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  doneCard: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  doneTitle: { color: authTheme.text, fontSize: 20, fontWeight: '800', marginTop: 4 },
  doneBody: { color: authTheme.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  doneStrong: { color: authTheme.text, fontWeight: '800' },
});
