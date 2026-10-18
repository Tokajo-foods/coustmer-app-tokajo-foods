import { BadgeCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { forgotPasswordStyles as otpStyles } from '@/components/auth/forgot-password-styles';
import { OtpCodeInput } from '@/components/auth/OtpCodeInput';
import { formatOtpClock } from '@/components/auth/use-otp-countdown';
import { useEmailChangeFlow } from '@/components/profile/use-email-change-flow';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  currentEmail?: string | null;
  onDone: () => void;
};

function SubmitButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      style={[otpStyles.submitBtn, disabled && otpStyles.submitBtnDisabled]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={otpStyles.submitBtnTextCalm}>{label}</Text>
    </Pressable>
  );
}

/** Current email code → new email → new email code → "Email updated". */
export function EmailChangeSection({ currentEmail, onDone }: Props) {
  const flow = useEmailChangeFlow(currentEmail);

  if (flow.stage === 'done') {
    return (
      <View style={styles.doneCard}>
        <BadgeCheck color={authTheme.success} size={40} strokeWidth={2} />
        <Text style={styles.doneTitle}>Email updated</Text>
        <Text style={styles.doneBody}>
          Your email is now <Text style={styles.doneStrong}>{flow.newEmail}</Text>. We sent a
          confirmation to the new address.
        </Text>
        <SubmitButton label="Done" onPress={onDone} />
      </View>
    );
  }

  const stepLabel =
    flow.stage === 'current'
      ? 'Step 1 of 2 · Verify your current email'
      : flow.currentEmail
        ? 'Step 2 of 2 · Verify your new email'
        : 'Add your email';

  const codeStep =
    (flow.stage === 'current' && flow.codeSentTo) || flow.stage === 'code' ? (
      <>
        <Text style={styles.hint}>
          Enter the 6-digit code sent to <Text style={styles.doneStrong}>{flow.codeSentTo}</Text>.
          {flow.stage === 'code' ? (
            <Text style={otpStyles.resendLink} onPress={flow.busy ? undefined : flow.editNewEmail}>
              {' '}Change email
            </Text>
          ) : null}
        </Text>
        <OtpCodeInput
          value={flow.code}
          onChange={flow.setCode}
          onComplete={(code) => void (flow.stage === 'code' ? flow.confirm(code) : flow.verifyCurrent(code))}
          disabled={flow.busy}
        />
        <SubmitButton
          label={flow.busy ? 'Please wait…' : flow.stage === 'code' ? 'Verify & save email' : 'Verify current email'}
          disabled={flow.busy || flow.code.length !== 6}
          onPress={() => void (flow.stage === 'code' ? flow.confirm() : flow.verifyCurrent())}
        />
        <View style={otpStyles.resendRow}>
          {flow.resendSecondsLeft > 0 ? (
            <Text style={otpStyles.resendMuted}>
              Resend code in {formatOtpClock(flow.resendSecondsLeft)}
            </Text>
          ) : (
            <Text style={otpStyles.resendMuted}>
              Didn’t get it?{' '}
              <Text style={otpStyles.resendLink} onPress={flow.busy ? undefined : () => void flow.resendCode()}>
                Resend code
              </Text>
            </Text>
          )}
        </View>
      </>
    ) : null;

  return (
    <View>
      <Text style={styles.stepLabel}>{stepLabel}</Text>
      {flow.error ? <AuthMessageBanner message={flow.error} type="error" /> : null}

      {flow.stage === 'current' && !flow.codeSentTo ? (
        <>
          <Text style={styles.hint}>
            First confirm it’s you. We’ll email a code to{' '}
            <Text style={styles.doneStrong}>{flow.currentEmail}</Text>.
          </Text>
          <SubmitButton
            label={flow.busy ? 'Sending…' : 'Send code to current email'}
            disabled={flow.busy}
            onPress={() => void flow.sendCurrent()}
          />
        </>
      ) : null}

      {flow.stage === 'new' ? (
        <>
          <AuthInput
            label="New email"
            value={flow.newEmail}
            onChangeText={flow.setNewEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <SubmitButton
            label={flow.busy ? 'Sending…' : 'Send code to new email'}
            disabled={flow.busy}
            onPress={() => void flow.sendNew()}
          />
        </>
      ) : null}

      {codeStep}
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
  hint: { color: authTheme.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  doneCard: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  doneTitle: { color: authTheme.text, fontSize: 20, fontWeight: '800', marginTop: 4 },
  doneBody: { color: authTheme.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  doneStrong: { color: authTheme.text, fontWeight: '800' },
});
