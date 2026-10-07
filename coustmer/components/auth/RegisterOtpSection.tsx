import { Pressable } from '@/components/common/Pressable';
import { CheckCircle2 } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';

import { RegisterOtpTimer } from '@/components/auth/RegisterOtpTimer';
import {
  formatOtpClock,
  useOtpValidityTimer,
} from '@/components/auth/use-otp-validity-timer';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  channel: 'email' | 'phone';
  verified: boolean;
  otpSent: boolean;
  otp: string;
  setOtp: (v: string) => void;
  otpError: string | null;
  focused: boolean;
  setFocused: (v: boolean) => void;
  isLoading: boolean;
  expiresAtMs: number | null;
  cooldownEndsAtMs: number | null;
  totalExpiresSeconds: number;
  onSend: () => void;
  onVerify: () => void;
  onResend: () => void;
};

export function RegisterOtpSection({
  channel,
  verified,
  otpSent,
  otp,
  setOtp,
  otpError,
  focused,
  setFocused,
  isLoading,
  expiresAtMs,
  cooldownEndsAtMs,
  totalExpiresSeconds,
  onSend,
  onVerify,
  onResend,
}: Props) {
  const cooldownLeft = useOtpValidityTimer(cooldownEndsAtMs);
  const validityLeft = useOtpValidityTimer(expiresAtMs);
  const expired = Boolean(expiresAtMs) && validityLeft <= 0;
  const canResend = cooldownLeft <= 0 && !isLoading;

  if (verified) {
    return (
      <View style={styles.otpVerifiedRow}>
        <CheckCircle2 color={authTheme.success} size={16} strokeWidth={2.2} />
        <Text style={styles.otpVerifiedText}>
          {channel === 'email' ? 'Email verified' : 'Phone verified'}
        </Text>
      </View>
    );
  }

  if (!otpSent) {
    return (
      <Pressable
        style={[styles.otpSendBtn, isLoading && styles.submitBtnDisabled]}
        onPress={onSend}
        disabled={isLoading}
      >
        <Text style={styles.otpSendBtnText}>
          {isLoading
            ? 'Sending…'
            : channel === 'email'
              ? 'Send email OTP'
              : 'Send phone OTP'}
        </Text>
      </Pressable>
    );
  }

  const digits = otp.padEnd(6).slice(0, 6).split('');
  const activeIndex = Math.min(otp.length, 5);
  const err = Boolean(otpError);

  return (
    <View style={styles.otpInlineCard}>
      <RegisterOtpTimer
        channel={channel}
        expiresAtMs={expiresAtMs}
        totalExpiresSeconds={totalExpiresSeconds}
      />

      <Text style={styles.otpInlineLabel}>
        {channel === 'email' ? 'Email verification code' : 'Phone verification code'}
      </Text>
      <View style={{ position: 'relative', marginBottom: 8 }}>
        <View style={styles.otpRow} pointerEvents="none">
          {digits.map((d, i) => {
            const filled = d.trim().length > 0;
            const active = focused && i === activeIndex;
            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  filled && styles.otpBoxFilled,
                  active && styles.otpBoxActive,
                  err && styles.otpBoxError,
                  expired && styles.otpBoxError,
                ]}
              >
                <Text style={styles.otpDigit}>{filled ? d : ''}</Text>
              </View>
            );
          })}
        </View>
        <TextInput
          style={styles.otpHiddenInput}
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          caretHidden
          editable={!expired}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
        />
      </View>
      {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

      {!expired ? (
        <Pressable
          style={[styles.submitBtn, { marginBottom: 10 }, isLoading && styles.submitBtnDisabled]}
          onPress={onVerify}
          disabled={isLoading}
        >
          <Text style={styles.submitBtnTextCalm}>
            {isLoading ? 'Verifying…' : 'Verify code'}
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.resendRow}>
        {canResend ? (
          <Text style={styles.resendMuted}>
            Didn’t get it?{' '}
            <Text style={styles.resendLink} onPress={onResend}>
              Resend code
            </Text>
          </Text>
        ) : (
          <Text style={styles.resendMuted}>
            Resend available in{' '}
            <Text style={styles.resendCountdown}>{formatOtpClock(cooldownLeft)}</Text>
          </Text>
        )}
      </View>
    </View>
  );
}
