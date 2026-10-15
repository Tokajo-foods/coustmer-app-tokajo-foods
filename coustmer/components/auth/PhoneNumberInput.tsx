import { Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { loginFormStyles as styles } from '@/components/auth/login-form-styles';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
  error?: string | null;
  editable?: boolean;
};

export function PhoneNumberInput({ value, onChangeText, onSubmit, error, editable = true }: Props) {
  const [focused, setFocused] = useState(false);
  const tint = error ? authTheme.error : focused ? authTheme.brand : authTheme.textDim;

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
        <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
          <Phone color={tint} size={18} strokeWidth={2} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="98765 43210 or +91…"
          placeholderTextColor={authTheme.textDim}
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          autoCorrect={false}
          maxLength={18}
          editable={editable}
          returnKeyType="go"
          onSubmitEditing={onSubmit}
          underlineColorAndroid="transparent"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
