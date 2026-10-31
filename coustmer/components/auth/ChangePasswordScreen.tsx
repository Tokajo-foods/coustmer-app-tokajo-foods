import { Pressable } from '@/components/common/Pressable';
import { useRouter } from 'expo-router';
import { BadgeCheck, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { changePasswordStyles as styles } from '@/components/auth/change-password-styles';
import { forgotPasswordStyles as otpStyles } from '@/components/auth/forgot-password-styles';
import { PasswordChangeVerifyStep } from '@/components/auth/PasswordChangeVerifyStep';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { usePasswordChangeFlow } from '@/components/auth/use-password-change-flow';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { authTheme } from '@/constants/auth-theme';
import { validateConfirmPassword, validatePassword } from '@/utils/validation';

function screenSubtitle(flow: ReturnType<typeof usePasswordChangeFlow>): string {
  if (flow.stage === 'loading') {
    if (flow.busy) return 'Sending verification codes to your registered contacts…';
    if (flow.banner) return 'We could not start verification. Fix the issue below and try again.';
    return 'Preparing verification…';
  }
  if (flow.stage === 'verify') {
    return 'For your security, confirm the codes sent to your email and phone on file.';
  }
  if (flow.stage === 'password') return 'Choose a strong password you have not used on this account before.';
  return '';
}

/** Profile → change password: email + phone OTP, then set a new password. */
export function ChangePasswordScreen() {
  const router = useRouter();
  const flow = usePasswordChangeFlow();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const subtitle = useMemo(() => screenSubtitle(flow), [flow]);

  const banner = flow.banner
    ? ({ message: flow.banner, type: 'error' as const })
    : null;

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
    <Pressable onPress={() => setShow((v) => !v)} accessibilityLabel={show ? 'Hide password' : 'Show password'}>
      {show ? <EyeOff color={authTheme.textMuted} size={18} /> : <Eye color={authTheme.textMuted} size={18} />}
    </Pressable>
  );

  if (flow.stage === 'done') {
    return (
      <ProfileFormLayout
        title="Change password"
        subtitle="Your account is updated"
        backFallback="/profile"
      >
        <View style={styles.doneCard}>
          <BadgeCheck color={authTheme.success} size={48} strokeWidth={2} />
          <Text style={styles.doneTitle}>Password changed</Text>
          <Text style={styles.doneBody}>
            Your password was updated successfully. Other devices were signed out for your security.
          </Text>
          <Pressable style={otpStyles.submitBtn} onPress={() => router.replace('/profile')}>
            <Text style={otpStyles.submitBtnTextCalm}>Back to profile</Text>
          </Pressable>
        </View>
      </ProfileFormLayout>
    );
  }

  return (
    <ProfileFormLayout
      title="Change password"
      subtitle={subtitle}
      banner={banner}
      backFallback="/profile"
      onSave={flow.stage === 'password' ? handleSave : undefined}
      saveLabel="Save new password"
      saving={flow.busy}
      saveDisabled={flow.stage !== 'password'}
    >
      {flow.stage === 'loading' ? (
        <View style={styles.loaderWrap}>
          {flow.busy ? (
            <ActivityIndicator color={authTheme.brand} size="large" />
          ) : (
            <>
              {flow.errorCode === 'CONTACT_MISSING' ? (
                <Pressable style={styles.contactBtn} onPress={() => router.push('/profile/contact')}>
                  <Text style={styles.contactBtnText}>Add phone or email</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[otpStyles.submitBtn, flow.busy && otpStyles.submitBtnDisabled]}
                disabled={flow.busy}
                onPress={() => void flow.retryStart()}
              >
                <Text style={otpStyles.submitBtnTextCalm}>Try again</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}

      {flow.stage === 'verify' ? (
        <>
          <Text style={styles.stepLabel}>Step 1 of 2 · Verify it's you</Text>
          <PasswordChangeVerifyStep flow={flow} />
        </>
      ) : null}

      {flow.stage === 'password' ? (
        <>
          <Text style={styles.stepLabel}>Step 2 of 2 · New password</Text>
          <AuthInput
            label="New password"
            icon={Lock}
            required
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Min 8 chars with uppercase & symbol"
            secureTextEntry={!show}
            error={errors.newPassword}
            rightElement={eye}
          />
          <PasswordStrengthMeter password={newPassword} />
          <AuthInput
            label="Confirm new password"
            icon={Lock}
            required
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            secureTextEntry={!show}
            error={errors.confirmPassword}
          />
        </>
      ) : null}
    </ProfileFormLayout>
  );
}
