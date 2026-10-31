import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { INK, LINE, ORANGE, ORANGE_SOFT } from '@/components/order/tracking/tracking-theme';
import { fonts } from '@/constants/typography';
import type { DropOtp } from '@/lib/delivery/types';

export function TrackingOtpCard({
  otp,
  atDoor,
  loading,
}: {
  otp: DropOtp | null | undefined;
  atDoor: boolean;
  loading?: boolean;
}) {
  const digits = otp?.otp?.trim();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{atDoor ? 'Confirm delivery' : 'Delivery OTP'}</Text>
      <View style={[styles.otpCard, atDoor && styles.otpCardUrgent]}>
        <Text style={styles.otpLabel}>
          {atDoor
            ? 'Share this OTP with your delivery partner to complete the order'
            : digits
              ? 'Share this with your partner when they arrive at your door'
              : 'Your drop OTP appears here once a delivery partner is assigned'}
        </Text>
        {loading && !digits ? (
          <ActivityIndicator color="#D97706" style={styles.loader} />
        ) : (
          <Text style={styles.otpValue}>{digits || '····'}</Text>
        )}
        {otp?.expiresAt ? (
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    padding: 12,
  },
  otpCardUrgent: { borderColor: ORANGE, backgroundColor: ORANGE_SOFT, borderWidth: 2 },
  otpLabel: { fontFamily: fonts.uiMedium, fontSize: 12, color: '#92400E' },
  otpValue: { marginTop: 4, fontFamily: fonts.displayBold, fontSize: 30, letterSpacing: 4, color: '#78350F' },
  loader: { marginTop: 8, alignSelf: 'flex-start' },
  otpExpiry: { marginTop: 4, fontFamily: fonts.ui, fontSize: 11, color: '#A16207' },
});
