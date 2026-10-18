import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { BadgeCheck, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { PasswordChangeVerifyStep } from '@/components/auth/PasswordChangeVerifyStep';
import { usePasswordChangeFlow } from '@/components/auth/use-password-change-flow';
import { authTheme } from '@/constants/auth-theme';
import { validateConfirmPassword, validatePassword } from '@/utils/validation';

const SUBTITLE: Record<string, string> = {
  loading: 'Sending verification codes…',
  verify: 'For your security, verify the codes sent to your registered email and phone.',
  password: 'Verified. Choose your new password.',
  done: '',
};

/** Settings → change password: email + phone OTP, then the new password. */
export function ChangePasswordScreen() {
  const router = useRouter();
  const flow = usePasswordChangeFlow();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const handleSave = async () => {
    const next = {
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    await flow.save(newPassword);
  };

  const eye = (
    <Pressable onPress={() => setShow((v) => !v)}>
      {show ? <EyeOff color={authTheme.textMuted} size={18} /> : <Eye color={authTheme.textMuted} size={18} />}
    </Pressable>
  );

  return (
    <AuthScreenLayout>
      <Pressable onPress={goBack}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      {flow.stage === 'done' ? (
        <View style={styles.done}>
          <BadgeCheck color={authTheme.success} size={48} strokeWidth={2} />
          <Text style={styles.title}>Password changed</Text>
          <Text style={styles.subtitle}>
            Your password was updated successfully. Other devices were signed out for your security.
          </Text>
          <AuthSubmitButton label="Done" onPress={goBack} />
        </View>
      ) : (
        <>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>{SUBTITLE[flow.stage]}</Text>
          {flow.banner ? <AuthMessageBanner message={flow.banner} type="error" /> : null}

          {flow.stage === 'loading' ? (
            flow.busy ? (
              <ActivityIndicator color={authTheme.brand} />
            ) : (
              <AuthSubmitButton label="Try again" onPress={() => void flow.retryStart()} />
            )
          ) : null}

          {flow.stage === 'verify' ? <PasswordChangeVerifyStep flow={flow} /> : null}

          {flow.stage === 'password' ? (
            <>
              <AuthInput
                label="New Password"
                icon={Lock}
                required
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min 8 chars with uppercase & symbol"
                secureTextEntry={!show}
                error={errors.newPassword}
                rightElement={eye}
              />
              <AuthInput
                label="Confirm New Password"
                icon={Lock}
                required
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                secureTextEntry={!show}
                error={errors.confirmPassword}
              />
              <AuthSubmitButton label="Save new password" onPress={handleSave} loading={flow.busy} />
            </>
          ) : null}
        </>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  back: { color: authTheme.accent, fontSize: 14, fontWeight: '600', marginBottom: 20 },
  title: { color: authTheme.text, fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: authTheme.textMuted, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  done: { alignItems: 'center', gap: 8, paddingTop: 24 },
});
