import { useRouter } from 'expo-router';
import { BadgeCheck, Eye, EyeOff, Lock } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordChangeVerifyStep } from '@/components/auth/PasswordChangeVerifyStep';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { usePasswordChangeFlow } from '@/components/auth/use-password-change-flow';
import { forgotPasswordStyles as otpStyles } from '@/components/auth/forgot-password-styles';
import { changePasswordStyles as styles } from '@/components/profile/change-password-styles';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
import { authTheme } from '@/constants/auth-theme';
import { validateConfirmPassword, validatePassword } from '@/utils/validation';

/** Profile → Account → change password. */
export function ChangePasswordScreen() {
  const router = useRouter();
  const flow = usePasswordChangeFlow();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const subtitle = useMemo(() => {
    if (flow.stage === 'password') return 'Step 2 of 2 · Choose a new password';
    if (flow.stage === 'verify') return 'Step 1 of 2 · Confirm email and phone codes';
    if (flow.stage === 'loading') return 'Preparing verification…';
    if (flow.stage === 'startFailed') return 'Could not start verification';
    return 'Verify your identity, then set a new password';
  }, [flow.stage]);

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
    const ok = await flow.save(newPassword);
    if (ok) {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const eye = (
    <Pressable
      onPress={() => setShow((v) => !v)}
      hitSlop={8}
      accessibilityLabel={show ? 'Hide password' : 'Show password'}
    >
      {show ? <EyeOff color={authTheme.textMuted} size={18} /> : <Eye color={authTheme.textMuted} size={18} />}
    </Pressable>
  );

  const body = (
    <>
      {flow.stage === 'loading' ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={authTheme.brand} size="large" />
          <Text style={styles.loadingHint}>Sending verification codes…</Text>
        </View>
      ) : null}

      {flow.stage === 'startFailed' ? (
        <View style={styles.loaderWrap}>
          {flow.banner ? <Text style={styles.errorText}>{flow.banner}</Text> : null}
          {flow.errorCode === 'CONTACT_MISSING' ? (
            <Pressable style={styles.contactBtn} onPress={() => router.push('/profile/contact')}>
              <Text style={styles.contactBtnText}>Add phone or email</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={[otpStyles.submitBtn, flow.busy && otpStyles.submitBtnDisabled]}
            disabled={flow.busy}
            onPress={() => flow.retryStart()}
          >
            <Text style={otpStyles.submitBtnTextCalm}>{flow.busy ? 'Retrying…' : 'Try again'}</Text>
          </Pressable>
        </View>
      ) : null}

      {flow.stage === 'verify' ? <PasswordChangeVerifyStep flow={flow} /> : null}

      {flow.stage === 'password' ? (
        <>
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
          <PasswordStrengthMeter password={newPassword} compact />
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
    </>
  );

  if (flow.stage === 'done') {
    return (
      <ProfileFormLayout
        title="Change password"
        subtitle="Your account is updated"
        backFallback="/profile"
        scrollable={false}
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
      scrollable={false}
      onSave={flow.stage === 'password' ? handleSave : undefined}
      saveLabel="Save new password"
      saving={flow.busy && flow.stage === 'password'}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={[styles.scrollPad, { paddingBottom: 24 + APP_BOTTOM_NAV_INSET }]}
      >
        {body}
      </ScrollView>
    </ProfileFormLayout>
  );
}
