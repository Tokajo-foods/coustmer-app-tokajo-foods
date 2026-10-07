import { Pressable } from '@/components/common/Pressable';
import { Mail, Phone, ShieldCheck } from 'lucide-react-native';
import { Text, TextInput, View } from 'react-native';

import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { authTheme } from '@/constants/auth-theme';

type Chrome = {
  focused: string | null;
  fieldError: string | null;
  setFocused: (k: string | null) => void;
  clearError: () => void;
  isLoading: boolean;
};

function tint(focused: string | null, key: string, err: boolean) {
  if (err) return authTheme.error;
  if (focused === key) return authTheme.brand;
  return authTheme.textDim;
}

export function RegisterEmailStep(
  props: Chrome & {
    email: string;
    setEmail: (v: string) => void;
    onSubmit: () => void;
  },
) {
  const err = Boolean(props.fieldError);
  return (
    <>
      <View style={styles.tipRow}>
        <View style={styles.tipIcon}>
          <Mail color={authTheme.brand} size={16} strokeWidth={2.2} />
        </View>
        <Text style={styles.tipText}>
          We’ll email a 6-digit code. Verify your inbox before adding a phone number.
        </Text>
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Email address</Text>
        <View
          style={[
            styles.inputContainer,
            props.focused === 'email' && styles.inputFocused,
            err && styles.inputError,
          ]}
        >
          <View style={styles.iconCircle}>
            <Mail color={tint(props.focused, 'email', err)} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="you@gmail.com"
            placeholderTextColor={authTheme.textDim}
            value={props.email}
            onChangeText={(t) => {
              props.setEmail(t);
              props.clearError();
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            onFocus={() => props.setFocused('email')}
            onBlur={() => props.setFocused(null)}
            returnKeyType="go"
            onSubmitEditing={props.onSubmit}
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
          {props.isLoading ? 'Sending…' : 'Send email code'}
        </Text>
      </Pressable>
    </>
  );
}

export function RegisterPhoneStep(
  props: Chrome & {
    phone: string;
    setPhone: (v: string) => void;
    onSubmit: () => void;
  },
) {
  const err = Boolean(props.fieldError);
  return (
    <>
      <View style={styles.tipRow}>
        <View style={styles.tipIcon}>
          <Phone color={authTheme.brand} size={16} strokeWidth={2.2} />
        </View>
        <Text style={styles.tipText}>
          Enter your Indian mobile number. We’ll text a 6-digit verification code.
        </Text>
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Phone number</Text>
        <View
          style={[
            styles.inputContainer,
            props.focused === 'phone' && styles.inputFocused,
            err && styles.inputError,
          ]}
        >
          <View style={styles.iconCircle}>
            <Phone color={tint(props.focused, 'phone', err)} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="+91 98765 43210"
            placeholderTextColor={authTheme.textDim}
            value={props.phone}
            onChangeText={(t) => {
              props.setPhone(t);
              props.clearError();
            }}
            keyboardType="phone-pad"
            maxLength={16}
            onFocus={() => props.setFocused('phone')}
            onBlur={() => props.setFocused(null)}
            returnKeyType="go"
            onSubmitEditing={props.onSubmit}
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
          {props.isLoading ? 'Sending…' : 'Send phone code'}
        </Text>
      </Pressable>
    </>
  );
}

export function RegisterOtpStep(
  props: Chrome & {
    otp: string;
    setOtp: (v: string) => void;
    onSubmit: () => void;
    onResend: () => void;
    channel: 'email' | 'phone';
  },
) {
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
          {props.channel === 'email'
            ? 'Enter the code from your email. It expires in a few minutes.'
            : 'Enter the SMS code we sent to your phone.'}
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
