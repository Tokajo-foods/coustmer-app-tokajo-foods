import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { loginFormStyles } from '@/components/auth/LoginFormContent';
import { authTheme } from '@/constants/auth-theme';
import { confirmFirebasePhoneOtp } from '@/lib/auth/firebase-phone';
import { useAuthStore } from '@/store/auth-store';
import { validateOtp } from '@/utils/validation';

type Props = {
  identifier?: string;
  verificationId?: string;
  onBackToLogin?: () => void;
  onVerifySuccess?: () => void;
};

export function VerifyOtpFormContent({
  identifier,
  verificationId,
  onBackToLogin,
  onVerifySuccess,
}: Props) {
  const router = useRouter();
  const loginWithFirebasePhone = useAuthStore((s) => s.loginWithFirebasePhone);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [otp, setOtp] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ message: string; type: 'error' | 'success' } | null>(
    null,
  );

  const handleVerify = async () => {
    if (!identifier) {
      setBanner({
        message: 'Missing email or phone. Please go back and try again.',
        type: 'error',
      });
      return;
    }
    if (!verificationId) {
      setBanner({
        message: 'OTP session expired. Go back and request a new code.',
        type: 'error',
      });
      return;
    }

    const otpError = validateOtp(otp);
    setError(otpError);
    setBanner(null);
    if (otpError) return;

    try {
      const idToken = await confirmFirebasePhoneOtp(verificationId, otp.trim());
      await loginWithFirebasePhone(idToken);
      onVerifySuccess?.();
      router.replace('/home');
    } catch (err) {
      setBanner({
        message: err instanceof Error ? err.message : 'Verification failed',
        type: 'error',
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={20}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to{'\n'}
          <Text style={{ color: authTheme.text, fontWeight: '600' }}>{identifier}</Text>
        </Text>

        {banner ? (
          <View style={{ marginBottom: 16 }}>
            <AuthMessageBanner message={banner.message} type={banner.type} />
          </View>
        ) : null}

        <View style={styles.fieldWrap}>
          <View
            style={[
              styles.inputContainer,
              focused && styles.inputFocused,
              error && styles.inputError,
            ]}
          >
            <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
              <ShieldCheck
                color={error ? authTheme.error : focused ? authTheme.brand : authTheme.textDim}
                size={18}
                strokeWidth={2}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor={authTheme.textDim}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (error) setError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              underlineColorAndroid="transparent"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && styles.submitBtnPressed,
            isLoading && styles.submitBtnDisabled,
          ]}
          onPress={() => void handleVerify()}
          disabled={isLoading}
        >
          <Text style={styles.submitBtnText}>{isLoading ? '...' : 'VERIFY & LOGIN'}</Text>
        </Pressable>

        {onBackToLogin ? (
          <View style={styles.bottomLinks}>
            <Text style={styles.signupText}>
              Wrong number?{' '}
              <Text style={styles.signupLink} onPress={onBackToLogin}>
                Go back
              </Text>
            </Text>
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = loginFormStyles;
