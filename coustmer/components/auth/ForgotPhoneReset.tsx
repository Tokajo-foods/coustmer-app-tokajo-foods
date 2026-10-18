import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import { PhoneOtpStep } from '@/components/auth/PhoneOtpStep';
import { useFirebasePhoneOtp } from '@/components/auth/use-firebase-phone-otp';
import { getAuthErrorCode } from '@/lib/auth/http';
import { describePhoneAuthError, PHONE_REVERIFY_CODES } from '@/lib/auth/phone-auth-errors';
import { phoneAuthApi } from '@/lib/auth/phone-auth-api';
import { precheckPhone } from '@/lib/auth/phone-precheck';
import { signOutFirebase } from '@/lib/auth/firebase-phone';
import { validateConfirmPassword, validatePassword } from '@/utils/validation';

type Props = {
  onDone: () => void;
};

/** Forgot password via Firebase phone OTP, then a one-time reset token. */
export function ForgotPhoneReset({ onDone }: Props) {
  const otp = useFirebasePhoneOtp({
    precheck: async (phone) => (await precheckPhone(phone, 'forgot_password'))?.message ?? null,
  });
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const issue = async (code: string) => {
    if (busy || otp.verifying) return;
    setBanner(null);
    const verified = await otp.verify(code);
    if (!verified) return;
    setBusy(true);
    try {
      const issued = await phoneAuthApi.forgotPassword({
        idToken: verified.idToken,
        phone: verified.phone,
      });
      await signOutFirebase();
      setResetToken(issued.resetToken);
    } catch (error) {
      const codeName = getAuthErrorCode(error);
      const message = describePhoneAuthError(error, 'Could not start the password reset.');
      if (codeName && PHONE_REVERIFY_CODES.has(codeName)) otp.requireReverify(message);
      else setBanner(message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!resetToken || busy) return;
    const err = validatePassword(password) || validateConfirmPassword(password, confirm);
    setFieldError(err);
    if (err) return;
    setBusy(true);
    setBanner(null);
    try {
      await phoneAuthApi.resetPassword(resetToken, password);
      onDone();
    } catch (error) {
      setBanner(describePhoneAuthError(error, 'Could not save the new password.'));
    } finally {
      setBusy(false);
    }
  };

  if (!resetToken) {
    return (
      <PhoneOtpStep
        otp={otp}
        onVerify={(code) => void issue(code)}
        submitting={busy}
        phoneTip="We’ll text a 6-digit code so you can set a new password."
        verifyLabel="Verify & continue"
      />
    );
  }

  return (
    <View>
      {banner ? <AuthMessageBanner message={banner} type="error" /> : null}
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>New password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder="8+ characters"
            style={styles.input}
          />
        </View>
      </View>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>Confirm password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Re-enter password"
            style={styles.input}
          />
        </View>
        {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}
      </View>
      <Pressable
        onPress={() => void save()}
        disabled={busy}
        style={[styles.submitBtn, busy && styles.submitBtnDisabled]}
      >
        <Text style={styles.submitBtnText}>{busy ? 'Saving…' : 'Save new password'}</Text>
      </Pressable>
    </View>
  );
}
