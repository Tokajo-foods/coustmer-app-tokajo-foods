import { Pressable } from '@/components/common/Pressable';
import { CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { ForgotOtpStep } from '@/components/auth/ForgotPasswordOtpStep';
import { ForgotStepIndicator } from '@/components/auth/ForgotPasswordProgress';
import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import {
  forgotFieldTint,
  type ForgotChromeProps,
  type ForgotStep,
} from '@/components/auth/forgot-password-types';
import { authTheme } from '@/constants/auth-theme';

export type { ForgotStep };
export { ForgotOtpStep, ForgotStepIndicator };

export function ForgotEmailStep(
  props: ForgotChromeProps & {
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
      <View style={styles.tipRow}>
        <View style={styles.tipIcon}>
          <Mail color={authTheme.brand} size={16} strokeWidth={2.2} />
        </View>
        <Text style={styles.tipText}>
          We’ll email a 6-digit code. Use the address linked to your Tokajo account.
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
            <Mail color={forgotFieldTint(props.focused, 'email', err)} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
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
          {props.isLoading ? 'Sending…' : 'Send verification code'}
        </Text>
      </Pressable>
    </>
  );
}

export function ForgotPasswordFields(
  props: ForgotChromeProps & {
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
      <View style={styles.tipRow}>
        <View style={styles.tipIcon}>
          <Lock color={authTheme.brand} size={16} strokeWidth={2.2} />
        </View>
        <Text style={styles.tipText}>
          Use at least 8 characters. You’ll sign in with this password next.
        </Text>
      </View>
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
            <Lock
              color={forgotFieldTint(props.focused, 'password', err)}
              size={18}
              strokeWidth={2}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Create password"
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
            <Lock
              color={forgotFieldTint(props.focused, 'confirm', err)}
              size={18}
              strokeWidth={2}
            />
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
            returnKeyType="done"
            onSubmitEditing={props.onSubmit}
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
        <Text style={styles.submitBtnTextCalm}>
          {props.isLoading ? 'Saving…' : 'Save new password'}
        </Text>
      </Pressable>
    </>
  );
}

export function ForgotSuccessStep({ onSignIn }: { onSignIn?: () => void }) {
  return (
    <View style={styles.successWrap}>
      <View style={styles.successRing}>
        <CheckCircle2 color={authTheme.success} size={40} strokeWidth={2} />
      </View>
      <Text style={styles.successTitle}>Password updated</Text>
      <Text style={styles.successBody}>
        Your new password is saved. Sign in with your email and updated password.
      </Text>
      <Pressable style={styles.submitBtn} onPress={() => onSignIn?.()}>
        <Text style={styles.submitBtnTextCalm}>Back to sign in</Text>
      </Pressable>
    </View>
  );
}
