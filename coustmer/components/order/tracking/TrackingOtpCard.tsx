import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GREEN, INK, LINE, ORANGE, ORANGE_SOFT } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import type { DropOtp } from '@/lib/delivery/types';

export function TrackingOtpCard({
  otp,
  atDoor,
  loading,
  verified,
}: {
  otp: DropOtp | null | undefined;
  atDoor: boolean;
  loading?: boolean;
  verified?: boolean;
}) {
  const digits = otp?.otp?.trim() ?? '';
  const showDigits = digits.length >= 4;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{atDoor ? 'Confirm delivery' : 'Delivery OTP'}</Text>
      <View style={[styles.otpCard, atDoor && styles.otpCardUrgent, verified && styles.otpCardDone]}>
        <Text style={styles.otpLabel}>
          {verified
            ? 'Delivery confirmed with your OTP'
            : atDoor
              ? 'Share this OTP with your delivery partner to complete the order'
              : showDigits
                ? 'Share this code when your partner arrives at your door'
                : 'Your secure delivery code will appear here once a partner is assigned'}
        </Text>
        {verified ? (
          <Text style={styles.verified}>Verified</Text>
        ) : loading && !showDigits ? (
          <View style={styles.digitRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.digitSlot}>
                <ActivityIndicator size="small" color="#D97706" />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.digitRow}>
            {(showDigits ? digits.split('') : ['•', '•', '•', '•']).map((ch, i) => (
              <View key={i} style={[styles.digitSlot, showDigits && styles.digitSlotFilled]}>
                <Text style={styles.digitText}>{ch}</Text>
              </View>
            ))}
          </View>
        )}
        {otp?.expiresAt && !verified ? (
          <Text style={styles.otpExpiry}>Expires {new Date(otp.expiresAt).toLocaleTimeString()}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: LINE },
  sectionTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: INK, letterSpacing: -0.2 },
  otpCard: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    padding: 14,
  },
  otpCardUrgent: { borderColor: ORANGE, backgroundColor: ORANGE_SOFT, borderWidth: 2 },
  otpCardDone: { borderColor: '#86EFAC', backgroundColor: '#ECFDF5' },
  otpLabel: { fontFamily: fonts.uiMedium, fontSize: 13, color: '#92400E', lineHeight: 18 },
  digitRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  digitSlot: {
    flex: 1,
    maxWidth: 56,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitSlotFilled: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  digitText: { fontFamily: fonts.displayBold, fontSize: 22, color: '#78350F' },
  verified: { marginTop: 10, fontFamily: fonts.uiBold, fontSize: 15, color: GREEN },
  otpExpiry: { marginTop: 10, fontFamily: fonts.ui, fontSize: 11, color: '#A16207' },
});
