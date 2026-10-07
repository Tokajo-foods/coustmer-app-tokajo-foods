import { Pressable } from '@/components/common/Pressable';
import { Eye, EyeOff, Gift, Lock, User } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

import type { RegisterFieldKey, RegisterFocusField } from '@/components/auth/register-form-helpers';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  values: {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    referralCode: string;
  };
  errors: Record<string, string | null>;
  focusedField: RegisterFocusField;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setFocusedField: (f: RegisterFocusField) => void;
  clearFieldError: (field: RegisterFieldKey) => void;
  setShowPassword: (v: boolean) => void;
  setShowConfirmPassword: (v: boolean) => void;
  onChange: {
    firstName: (v: string) => void;
    lastName: (v: string) => void;
    password: (v: string) => void;
    confirmPassword: (v: string) => void;
    referralCode: (v: string) => void;
  };
};

export function RegisterFormFields({
  values,
  errors,
  focusedField,
  showPassword,
  showConfirmPassword,
  setFocusedField,
  clearFieldError,
  setShowPassword,
  setShowConfirmPassword,
  onChange,
}: Props) {
  const inputStyle = (field: RegisterFocusField, hasError: boolean) => [
    styles.inputContainer,
    focusedField === field && styles.inputFocused,
    hasError && styles.inputError,
  ];

  const iconColor = (field: RegisterFocusField, hasError: boolean) => {
    if (hasError) return authTheme.error;
    if (focusedField === field) return authTheme.brand;
    return authTheme.textDim;
  };

  const renderInput = (
    field: RegisterFieldKey,
    label: string,
    opts: {
      icon: typeof User;
      placeholder: string;
      value: string;
      onChangeText: (text: string) => void;
      error?: string | null;
      secureTextEntry?: boolean;
      autoCapitalize?: 'none' | 'words' | 'characters';
      maxLength?: number;
      returnKeyType?: 'next' | 'done';
      rightElement?: ReactNode;
    },
  ) => {
    const Icon = opts.icon;
    return (
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={inputStyle(field, Boolean(opts.error))}>
          <View style={[styles.iconCircle, focusedField === field && styles.iconCircleFocused]}>
            <Icon color={iconColor(field, Boolean(opts.error))} size={18} strokeWidth={2} />
          </View>
          <TextInput
            style={styles.input}
            placeholder={opts.placeholder}
            placeholderTextColor={authTheme.textDim}
            value={opts.value}
            onChangeText={(text) => {
              opts.onChangeText(text);
              clearFieldError(field);
            }}
            secureTextEntry={opts.secureTextEntry}
            autoCapitalize={opts.autoCapitalize ?? 'none'}
            autoCorrect={false}
            returnKeyType={opts.returnKeyType}
            maxLength={opts.maxLength}
            underlineColorAndroid="transparent"
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
          />
          {opts.rightElement ? <View style={styles.rightSlot}>{opts.rightElement}</View> : null}
        </View>
        {opts.error ? (
          <Text style={styles.errorText} numberOfLines={3}>
            {opts.error}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <>
      <Text style={styles.sectionLabel}>About you</Text>
      <View style={styles.row}>
        <View style={styles.half}>
          {renderInput('firstName', 'First name', {
            icon: User,
            placeholder: 'Rahul',
            value: values.firstName,
            onChangeText: onChange.firstName,
            error: errors.firstName,
            autoCapitalize: 'words',
            returnKeyType: 'next',
          })}
        </View>
        <View style={styles.half}>
          {renderInput('lastName', 'Last name', {
            icon: User,
            placeholder: 'Sharma',
            value: values.lastName,
            onChangeText: onChange.lastName,
            error: errors.lastName,
            autoCapitalize: 'words',
            returnKeyType: 'next',
          })}
        </View>
      </View>

      <Text style={styles.sectionLabel}>Security</Text>
      {renderInput('password', 'Password', {
        icon: Lock,
        placeholder: 'Min 8 chars, uppercase & symbol',
        value: values.password,
        onChangeText: onChange.password,
        error: errors.password,
        secureTextEntry: !showPassword,
        returnKeyType: 'next',
        rightElement: (
          <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
            {showPassword ? (
              <EyeOff color={authTheme.textMuted} size={20} />
            ) : (
              <Eye color={authTheme.textMuted} size={20} />
            )}
          </Pressable>
        ),
      })}
      {renderInput('confirmPassword', 'Confirm password', {
        icon: Lock,
        placeholder: 'Re-enter password',
        value: values.confirmPassword,
        onChangeText: onChange.confirmPassword,
        error: errors.confirmPassword,
        secureTextEntry: !showConfirmPassword,
        returnKeyType: 'done',
        rightElement: (
          <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={10}>
            {showConfirmPassword ? (
              <EyeOff color={authTheme.textMuted} size={20} />
            ) : (
              <Eye color={authTheme.textMuted} size={20} />
            )}
          </Pressable>
        ),
      })}

      <Text style={styles.sectionLabel}>Referral code</Text>
      {renderInput('referralCode', 'Code (optional)', {
        icon: Gift,
        placeholder: 'Friend’s code',
        value: values.referralCode,
        onChangeText: (t) => onChange.referralCode(t.toUpperCase()),
        error: errors.referralCode,
        autoCapitalize: 'characters',
        maxLength: 20,
        returnKeyType: 'done',
      })}
      {!errors.referralCode ? (
        <Text style={styles.hint}>You and your friend both get wallet credit once.</Text>
      ) : null}
    </>
  );
}
