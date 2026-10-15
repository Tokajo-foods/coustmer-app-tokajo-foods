import { useRef, useState } from 'react';
import { Pressable, TextInput, View, Text } from 'react-native';

import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';

const OTP_LENGTH = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Fires once all 6 digits are present (typed, pasted or OS SMS autofill). */
  onComplete?: (code: string) => void;
  error?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function OtpCodeInput({ value, onChange, onComplete, error, disabled, autoFocus = true }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.padEnd(OTP_LENGTH).slice(0, OTP_LENGTH).split('');
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(next);
    if (next.length === OTP_LENGTH && next !== value) onComplete?.(next);
  };

  return (
    <View style={styles.otpFieldWrap}>
      <Text style={styles.fieldLabel}>Verification code</Text>
      <Pressable onPress={() => inputRef.current?.focus()} style={{ position: 'relative' }}>
        <View style={styles.otpRow} pointerEvents="none">
          {digits.map((d, i) => {
            const filled = d.trim().length > 0;
            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  filled && styles.otpBoxFilled,
                  focused && i === activeIndex && styles.otpBoxActive,
                  error && styles.otpBoxError,
                ]}
              >
                <Text style={styles.otpDigit}>{filled ? d : ''}</Text>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          style={styles.otpHiddenInput}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          autoFocus={autoFocus}
          editable={!disabled}
          caretHidden
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          importantForAutofill="yes"
          accessibilityLabel="6-digit verification code"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
