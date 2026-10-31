import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PhoneOtpStep } from '@/components/auth/PhoneOtpStep';
import { VerifiedPhoneChip } from '@/components/auth/VerifiedPhoneChip';
import { useFirebasePhoneOtp } from '@/components/auth/use-firebase-phone-otp';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  phone: string;
  maskedPhone?: string | null;
  disabled?: boolean;
  onIdToken: (token: string | null) => void;
  onReverifyRequired?: (message: string) => void;
};

/** Phone OTP isolated so SMS countdown does not re-render the whole change-password screen. */
export function ChangePasswordPhoneSection({
  phone,
  maskedPhone,
  disabled,
  onIdToken,
  onReverifyRequired,
}: Props) {
  const autoSendRef = useRef(false);
  const otp = useFirebasePhoneOtp({
    initialPhone: phone,
    onAutoVerified: ({ idToken }) => onIdToken(idToken),
  });

  useEffect(() => {
    if (autoSendRef.current || otp.blockedReason) return;
    if (otp.step !== 'phone') return;
    autoSendRef.current = true;
    void otp.send(phone, { skipPrecheck: true });
  }, [phone, otp.step, otp.blockedReason, otp.send]);

  useEffect(() => {
    if (otp.step !== 'verified') return;
    let cancelled = false;
    void otp.getIdTokenForSubmit().then((token) => {
      if (cancelled) return;
      onIdToken(token);
      if (!token) {
        onReverifyRequired?.('Phone verification expired. Send a new OTP.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [otp.step, otp.getIdTokenForSubmit, onIdToken, onReverifyRequired]);

  const verifyPhoneCode = async (code: string) => {
    if (otp.verifying || disabled) return;
    const verified = await otp.verify(code);
    if (!verified) return;
    const token = await otp.getIdTokenForSubmit();
    onIdToken(token);
    if (!token) onReverifyRequired?.('Phone verification expired. Send a new OTP.');
  };

  return (
    <View style={styles.block}>
      {otp.step === 'verified' && otp.phone ? (
        <VerifiedPhoneChip phone={otp.phone} />
      ) : (
        <PhoneOtpStep
          otp={otp}
          lockPhone
          onVerify={(code) => void verifyPhoneCode(code)}
          phoneTip={`We’ll text a code to your registered number ${maskedPhone ?? ''}.`}
          sendLabel="Send OTP to my phone"
          verifyLabel="Verify phone"
        />
      )}
      {otp.step === 'verified' ? (
        <Pressable
          style={styles.linkBtn}
          onPress={() => {
            autoSendRef.current = false;
            otp.changeNumber();
            onIdToken(null);
          }}
          disabled={disabled}
        >
          <Text style={styles.linkText}>Send a new phone code</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 0 },
  linkBtn: { marginTop: 8, alignSelf: 'flex-start' },
  linkText: { color: authTheme.brand, fontSize: 13, fontWeight: '700' },
});
