import { Pressable } from '@/components/common/Pressable';
import { CheckCircle2 } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';

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
  onSend,
  onVerify,
  onResend,
}: Props) {
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
        />
      </View>
      {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
      <Pressable
        style={[styles.submitBtn, { marginBottom: 10 }, isLoading && styles.submitBtnDisabled]}
        onPress={onVerify}
        disabled={isLoading}
      >
        <Text style={styles.submitBtnTextCalm}>
          {isLoading ? 'Verifying…' : 'Verify code'}
        </Text>
      </Pressable>
      <View style={styles.resendRow}>
        <Text style={styles.resendMuted}>
          Didn’t get it?{' '}
          <Text style={styles.resendLink} onPress={isLoading ? undefined : onResend}>
            Resend
          </Text>
        </Text>
      </View>
    </View>
  );
}
