import { Pressable } from '@/components/common/Pressable';
import { ShieldCheck } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';

import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import type { ForgotChromeProps } from '@/components/auth/forgot-password-types';
import { authTheme } from '@/constants/auth-theme';

type Props = ForgotChromeProps & {
  otp: string;
  setOtp: (v: string) => void;
  clearError: () => void;
  onSubmit: () => void;
  onResend: () => void;
  isLoading: boolean;
};

export function ForgotOtpStep(props: Props) {
  const err = Boolean(props.fieldError);
  const digits = props.otp.padEnd(6).slice(0, 6).split('');
  const activeIndex = Math.min(props.otp.length, 5);

  return (
    <>
      <View style={styles.tipRow}>
        <View style={styles.tipIcon}>
          <ShieldCheck color={authTheme.brand} size={16} strokeWidth={2.2} />
        </View>
        <Text style={styles.tipText}>
          Enter the code from your inbox. It expires in a few minutes.
        </Text>
      </View>
      <View style={styles.otpFieldWrap}>
        <Text style={styles.fieldLabel}>Verification code</Text>
        <View style={{ position: 'relative' }}>
          <View style={styles.otpRow} pointerEvents="none">
            {digits.map((d, i) => {
              const filled = d.trim().length > 0;
              const active = props.focused === 'otp' && i === activeIndex;
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
            value={props.otp}
            onChangeText={(t) => {
              props.setOtp(t.replace(/\D/g, '').slice(0, 6));
              props.clearError();
            }}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            caretHidden
            onFocus={() => props.setFocused('otp')}
            onBlur={() => props.setFocused(null)}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
          />
        </View>
        {props.fieldError ? <Text style={styles.errorText}>{props.fieldError}</Text> : null}
      </View>
      <Pressable
        style={[styles.submitBtn, props.isLoading && styles.submitBtnDisabled]}
        onPress={props.onSubmit}
        disabled={props.isLoading}
      >
        <Text style={styles.submitBtnTextCalm}>
          {props.isLoading ? 'Verifying…' : 'Verify code'}
        </Text>
      </Pressable>
      <View style={styles.resendRow}>
        <Text style={styles.resendMuted}>
          Didn’t get it?{' '}
          <Text style={styles.resendLink} onPress={props.isLoading ? undefined : props.onResend}>
            Resend code
          </Text>
        </Text>
      </View>
    </>
  );
}
