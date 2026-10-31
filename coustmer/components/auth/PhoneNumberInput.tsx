import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { loginFormStyles as styles } from '@/components/auth/login-form-styles';
import { authTheme } from '@/constants/auth-theme';
import { formatIndianLocal, toIndianLocalDigits } from '@/lib/auth/phone-number';

type Props = {
  value: string;
  /** Receives only the 10 local digits; callers normalize to +91 E.164. */
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
  error?: string | null;
  editable?: boolean;
};

/** Indian mobile: fixed +91 prefix, the customer types only the 10-digit number. */
export function PhoneNumberInput({ value, onChangeText, onSubmit, error, editable = true }: Props) {
  const [focused, setFocused] = useState(false);
  const digits = toIndianLocalDigits(value);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>Mobile number</Text>
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        <View style={local.prefix}>
          <Text style={[local.prefixText, focused && local.prefixFocused]}>+91</Text>
          <View style={local.divider} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="98765 43210"
          placeholderTextColor={authTheme.textDim}
          value={formatIndianLocal(digits)}
          onChangeText={(text) => onChangeText(toIndianLocalDigits(text))}
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          autoCorrect={false}
          editable={editable}
          returnKeyType="go"
          onSubmitEditing={onSubmit}
          underlineColorAndroid="transparent"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel="10-digit mobile number"
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const local = StyleSheet.create({
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 10 },
  prefixText: { fontSize: 15, fontWeight: '700', color: authTheme.textDim },
  prefixFocused: { color: authTheme.brand },
  divider: { width: StyleSheet.hairlineWidth * 2, height: 20, backgroundColor: authTheme.brandMuted },
});
