import { memo } from 'react';
import { Mail } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChangePasswordPhoneSection } from '@/components/auth/ChangePasswordPhoneSection';
import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import { OtpCodeInput } from '@/components/auth/OtpCodeInput';
import type { PasswordChangeFlow } from '@/components/auth/use-password-change-flow';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  flow: PasswordChangeFlow;
};

function PasswordChangeVerifyStepInner({ flow }: Props) {
  const { info } = flow;
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

      {info.phoneRequired && info.phone ? (
        <View style={local.block}>
          <Text style={local.heading}>
            {info.emailRequired ? '2. Code on your phone' : 'Code on your phone'}
          </Text>
          <ChangePasswordPhoneSection
            phone={info.phone}
            maskedPhone={info.maskedPhone}
            disabled={flow.busy}
            onIdToken={flow.setPhoneIdToken}
          />
        </View>
      ) : null}

      {flow.verifyHint ? <Text style={local.hint}>{flow.verifyHint}</Text> : null}

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

export const PasswordChangeVerifyStep = memo(PasswordChangeVerifyStepInner);

const local = StyleSheet.create({
  block: { marginBottom: 20 },
  heading: { color: authTheme.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  hint: {
    color: authTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    fontWeight: '500',
  },
});
