import { Mail } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import { OtpCodeInput } from '@/components/auth/OtpCodeInput';
import { PhoneOtpStep } from '@/components/auth/PhoneOtpStep';
import type { PasswordChangeFlow } from '@/components/auth/use-password-change-flow';
import { VerifiedPhoneChip } from '@/components/auth/VerifiedPhoneChip';
import { authTheme } from '@/constants/auth-theme';

/** Email OTP + phone OTP on the registered contacts, then "Verify & continue". */
export function PasswordChangeVerifyStep({ flow }: { flow: PasswordChangeFlow }) {
  const { info, phoneOtp } = flow;
  if (!info) return null;

  return (
    <View>
      {info.emailRequired ? (
        <View style={local.block}>
          <Text style={local.heading}>1. Code from your email</Text>
          {flow.emailNotice ? (
            <View style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Mail color={authTheme.brand} size={16} strokeWidth={2.2} />
              </View>
              <Text style={styles.tipText}>{flow.emailNotice}</Text>
            </View>
          ) : null}
          <OtpCodeInput
            value={flow.emailCode}
            onChange={flow.setEmailCode}
            error={flow.emailError}
            disabled={flow.busy}
          />
          <Text style={styles.resendMuted}>
            Didn’t get it?{' '}
            <Text style={styles.resendLink} onPress={flow.busy ? undefined : () => void flow.resendEmail()}>
              Resend email code
            </Text>
          </Text>
        </View>
      ) : null}

      {info.phoneRequired ? (
        <View style={local.block}>
          <Text style={local.heading}>{info.emailRequired ? '2. ' : ''}Code on your phone</Text>
          {phoneOtp.step === 'verified' && phoneOtp.phone ? (
            <VerifiedPhoneChip phone={phoneOtp.phone} />
          ) : (
            <PhoneOtpStep
              otp={phoneOtp}
              lockPhone
              onVerify={(code) => void flow.verifyPhoneCode(code)}
              phoneTip={`We’ll text a code to your registered number ${info.maskedPhone ?? ''}.`}
              sendLabel="Send OTP to my phone"
              verifyLabel="Verify phone"
            />
          )}
        </View>
      ) : null}

      <Pressable
        style={[styles.submitBtn, !flow.canVerify && styles.submitBtnDisabled]}
        onPress={() => void flow.verify()}
        disabled={!flow.canVerify}
      >
        <Text style={styles.submitBtnText}>{flow.busy ? 'Verifying…' : 'Verify & continue'}</Text>
      </Pressable>
    </View>
  );
}

const local = StyleSheet.create({
  block: { marginBottom: 20 },
  heading: { color: authTheme.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
});
