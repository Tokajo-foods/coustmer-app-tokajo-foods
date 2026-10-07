import { Pressable } from '@/components/common/Pressable';
import { CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import { authTheme } from '@/constants/auth-theme';

export type ForgotStep = 'email' | 'otp' | 'password' | 'done';

type ChromeProps = {
  focused: string | null;
  fieldError: string | null;
  setFocused: (key: string | null) => void;
};

function tint(focused: string | null, key: string, err: boolean) {
  if (err) return authTheme.error;
  if (focused === key) return authTheme.brand;
  return authTheme.textDim;
}

export function ForgotStepIndicator({ step }: { step: ForgotStep }) {
  if (step === 'done') return null;
  const order: Array<'email' | 'otp' | 'password'> = ['email', 'otp', 'password'];
  const idx = order.indexOf(step as 'email' | 'otp' | 'password');
  return (
    <View style={styles.stepsRow}>
      {order.map((key, i) => {
        const on = i <= idx;
        return (
          <View key={key} style={styles.stepItem}>
            <View style={[styles.stepDot, on && styles.stepDotOn]}>
              <Text style={[styles.stepNum, on && styles.stepNumOn]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, on && styles.stepLabelOn]}>
              {key === 'email' ? 'Email' : key === 'otp' ? 'OTP' : 'Password'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function ForgotEmailStep(
  props: ChromeProps & {
    email: string;
    setEmail: (v: string) => void;
    clearError: () => void;
    onSubmit: () => void;
    isLoading: boolean;
  },
) {
  const err = Boolean(props.fieldError);
  return (
    <>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Email</Text>
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
            onFocus={() => props.setFocused('email')}
            onBlur={() => props.setFocused(null)}
          />
        </View>
        {props.fieldError ? <Text style={styles.errorText}>{props.fieldError}</Text> : null}
      </View>
      <Pressable
        style={[styles.submitBtn, props.isLoading && styles.submitBtnDisabled]}
        onPress={props.onSubmit}
        disabled={props.isLoading}
      >
        <Text style={styles.submitBtnText}>{props.isLoading ? '...' : 'SEND OTP'}</Text>
      </Pressable>
    </>
  );
}

export function ForgotOtpStep(
  props: ChromeProps & {
    otp: string;
    setOtp: (v: string) => void;
    clearError: () => void;
    onSubmit: () => void;
    onResend: () => void;
    isLoading: boolean;
  },
) {
  const err = Boolean(props.fieldError);
  return (
    <>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>OTP code</Text>
        <View
          style={[
            styles.inputContainer,
            props.focused === 'otp' && styles.inputFocused,
            err && styles.inputError,
          ]}
        >
          <View style={styles.iconCircle}>
            <ShieldCheck color={tint(props.focused, 'otp', err)} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            placeholderTextColor={authTheme.textDim}
            value={props.otp}
            onChangeText={(t) => {
              props.setOtp(t.replace(/\D/g, '').slice(0, 6));
              props.clearError();
            }}
            keyboardType="number-pad"
            maxLength={6}
            onFocus={() => props.setFocused('otp')}
            onBlur={() => props.setFocused(null)}
          />
        </View>
        {props.fieldError ? <Text style={styles.errorText}>{props.fieldError}</Text> : null}
      </View>
      <Pressable
        style={[styles.submitBtn, props.isLoading && styles.submitBtnDisabled]}
        onPress={props.onSubmit}
        disabled={props.isLoading}
      >
        <Text style={styles.submitBtnText}>{props.isLoading ? '...' : 'VERIFY OTP'}</Text>
      </Pressable>
      <Pressable onPress={props.onResend} disabled={props.isLoading} style={{ marginBottom: 12 }}>
        <Text style={styles.resendText}>Resend OTP</Text>
      </Pressable>
    </>
  );
}

export function ForgotPasswordFields(
  props: ChromeProps & {
    password: string;
    confirm: string;
    setPassword: (v: string) => void;
    setConfirm: (v: string) => void;
    clearError: () => void;
    onSubmit: () => void;
    isLoading: boolean;
  },
) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const err = Boolean(props.fieldError);
  return (
    <>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>New password</Text>
        <View
          style={[
            styles.inputContainer,
            props.focused === 'password' && styles.inputFocused,
            err && styles.inputError,
          ]}
        >
          <View style={styles.iconCircle}>
            <Lock color={tint(props.focused, 'password', err)} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor={authTheme.textDim}
            value={props.password}
            onChangeText={(t) => {
              props.setPassword(t);
              props.clearError();
            }}
            secureTextEntry={!showPassword}
            onFocus={() => props.setFocused('password')}
            onBlur={() => props.setFocused(null)}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.rightSlot}>
            {showPassword ? (
              <EyeOff color={authTheme.textMuted} size={18} />
            ) : (
              <Eye color={authTheme.textMuted} size={18} />
            )}
          </Pressable>
        </View>
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Confirm password</Text>
        <View
          style={[
            styles.inputContainer,
            props.focused === 'confirm' && styles.inputFocused,
            err && styles.inputError,
          ]}
        >
          <View style={styles.iconCircle}>
            <Lock color={tint(props.focused, 'confirm', err)} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            placeholderTextColor={authTheme.textDim}
            value={props.confirm}
            onChangeText={(t) => {
              props.setConfirm(t);
              props.clearError();
            }}
            secureTextEntry={!showConfirm}
            onFocus={() => props.setFocused('confirm')}
            onBlur={() => props.setFocused(null)}
          />
          <Pressable onPress={() => setShowConfirm((v) => !v)} style={styles.rightSlot}>
            {showConfirm ? (
              <EyeOff color={authTheme.textMuted} size={18} />
            ) : (
              <Eye color={authTheme.textMuted} size={18} />
            )}
          </Pressable>
        </View>
        {props.fieldError ? <Text style={styles.errorText}>{props.fieldError}</Text> : null}
      </View>
      <Pressable
        style={[styles.submitBtn, props.isLoading && styles.submitBtnDisabled]}
        onPress={props.onSubmit}
        disabled={props.isLoading}
      >
        <Text style={styles.submitBtnText}>{props.isLoading ? '...' : 'SAVE PASSWORD'}</Text>
      </Pressable>
    </>
  );
}

export function ForgotSuccessStep({ onSignIn }: { onSignIn?: () => void }) {
  return (
    <View style={styles.successCard}>
      <CheckCircle2 color={authTheme.success} size={40} strokeWidth={2} />
      <Text style={styles.successTitle}>Saved successfully</Text>
      <Text style={styles.successBody}>
        Your password was updated. Sign in with your new password.
      </Text>
      <Pressable style={styles.submitBtn} onPress={() => onSignIn?.()}>
        <Text style={styles.submitBtnText}>BACK TO SIGN IN</Text>
      </Pressable>
    </View>
  );
}
