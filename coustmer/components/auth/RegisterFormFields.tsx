import { Pressable } from '@/components/common/Pressable';
import { Eye, EyeOff, Gift, Lock, Mail, User } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { RegisterOtpSection } from '@/components/auth/RegisterOtpSection';
import type { RegisterFieldKey, RegisterFocusField } from '@/components/auth/register-form-helpers';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import type { RegisterEmailOtp } from '@/components/auth/use-register-email-otp';
import type { RegisterValues } from '@/components/auth/use-register-signup-flow';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  values: RegisterValues;
  errors: Partial<Record<RegisterFieldKey, string | null>>;
  onChange: (field: RegisterFieldKey, value: string) => void;
  editable?: boolean;
  emailOtp: RegisterEmailOtp;
};

type InputOpts = {
  icon: typeof User;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'characters';
  autoComplete?: 'name-given' | 'name-family' | 'email' | 'new-password' | 'off';
  maxLength?: number;
  transform?: (text: string) => string;
  rightElement?: ReactNode;
};

/** Sign-up details collected after the phone is verified. */
export function RegisterFormFields({ values, errors, onChange, editable = true, emailOtp }: Props) {
  const [focusedField, setFocusedField] = useState<RegisterFocusField>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const renderInput = (field: RegisterFieldKey, label: string, opts: InputOpts) => {
    const Icon = opts.icon;
    const error = errors[field];
    const focused = focusedField === field;
    const tint = error ? authTheme.error : focused ? authTheme.brand : authTheme.textDim;
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[styles.inputContainer, focused && styles.inputFocused, error && styles.inputError]}>
          <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
            <Icon color={tint} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder={opts.placeholder}
            placeholderTextColor={authTheme.textDim}
            value={values[field]}
            onChangeText={(text) => onChange(field, opts.transform ? opts.transform(text) : text)}
            secureTextEntry={opts.secureTextEntry}
            keyboardType={opts.keyboardType}
            autoCapitalize={opts.autoCapitalize ?? 'none'}
            autoComplete={opts.autoComplete}
            autoCorrect={false}
            maxLength={opts.maxLength}
            editable={editable}
            underlineColorAndroid="transparent"
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
          />
          {opts.rightElement ? <View style={styles.rightSlot}>{opts.rightElement}</View> : null}
        </View>
        {error ? (
          <Text style={styles.errorText} numberOfLines={3}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  };

  const eyeToggle = (shown: boolean, toggle: () => void) => (
    <Pressable onPress={toggle} hitSlop={10}>
      {shown ? (
        <EyeOff color={authTheme.textMuted} size={20} />
      ) : (
        <Eye color={authTheme.textMuted} size={20} />
      )}
    </Pressable>
  );

  return (
    <>
      <Text style={styles.sectionLabel}>About you</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          {renderInput('firstName', 'First name', {
            icon: User,
            placeholder: 'Rahul',
            autoCapitalize: 'words',
            autoComplete: 'name-given',
            maxLength: 50,
          })}
        </View>
        <View style={styles.half}>
          {renderInput('lastName', 'Last name (optional)', {
            icon: User,
            placeholder: 'Sharma',
            autoCapitalize: 'words',
            autoComplete: 'name-family',
            maxLength: 50,
          })}
        </View>
      </View>

      {renderInput('email', 'Email', {
        icon: Mail,
        placeholder: 'you@gmail.com',
        keyboardType: 'email-address',
        autoComplete: 'email',
      })}

      {emailOtp.banner ? (
        <Text style={styles.errorText} numberOfLines={4}>
          {emailOtp.banner}
        </Text>
      ) : null}
      <RegisterOtpSection
        channel="email"
        verified={emailOtp.verified}
        otpSent={emailOtp.otpSent}
        otp={emailOtp.otp}
        setOtp={emailOtp.setOtp}
        otpError={emailOtp.otpError ?? errors.email ?? null}
        focused={emailOtp.focused}
        setFocused={emailOtp.setFocused}
        isLoading={emailOtp.busyMode !== 'idle'}
        busyMode={emailOtp.busyMode}
        timerKey={emailOtp.timerKey}
        onSend={() => void emailOtp.send(values.email)}
        onVerify={() => void emailOtp.verify(values.email)}
        onResend={() => void emailOtp.resend(values.email)}
      />

      <Text style={styles.sectionLabel}>Security</Text>
      {renderInput('password', 'Password', {
        icon: Lock,
        placeholder: 'Min 8 chars, Aa, 1 & symbol',
        secureTextEntry: !showPassword,
        autoComplete: 'new-password',
        maxLength: 128,
        rightElement: eyeToggle(showPassword, () => setShowPassword((v) => !v)),
      })}
      <PasswordStrengthMeter password={values.password} />
      {renderInput('confirmPassword', 'Confirm password', {
        icon: Lock,
        placeholder: 'Re-enter password',
        secureTextEntry: !showConfirm,
        autoComplete: 'new-password',
        maxLength: 128,
        rightElement: eyeToggle(showConfirm, () => setShowConfirm((v) => !v)),
      })}

      <Text style={styles.sectionLabel}>Referral code</Text>
      {renderInput('referralCode', 'Code (optional)', {
        icon: Gift,
        placeholder: 'Friend’s code',
        autoCapitalize: 'characters',
        maxLength: 20,
        transform: (t) => t.toUpperCase(),
      })}
      {!errors.referralCode ? (
        <Text style={styles.hint}>You and your friend both get wallet credit once.</Text>
      ) : null}
    </>
  );
}
