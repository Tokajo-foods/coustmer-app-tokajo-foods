import { Pressable } from '@/components/common/Pressable';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { EmailChangeSection } from '@/components/profile/EmailChangeSection';
import { PhoneChangeSection } from '@/components/profile/PhoneChangeSection';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { authTheme } from '@/constants/auth-theme';
import { formatPhoneForDisplay } from '@/lib/auth/phone-number';
import { useUserProfile } from '@/lib/profile/hooks';

export function ContactScreen() {
  const { data: profile } = useUserProfile();
  const [changingPhone, setChangingPhone] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  return (
    <ProfileFormLayout title="Phone & email" subtitle="Changes are verified with a one-time code">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phone number</Text>
        {!profile ? (
          <ActivityIndicator color={authTheme.brand} style={styles.loader} />
        ) : changingPhone ? (
          <PhoneChangeSection currentPhone={profile.phone} onDone={() => setChangingPhone(false)} />
        ) : (
          <>
            <Text style={styles.value}>
              {profile.phone ? formatPhoneForDisplay(profile.phone) : 'No phone number yet'}
            </Text>
            <Text style={styles.hint}>
              We verify your current number and the new number with an OTP.
            </Text>
            <Pressable
              style={styles.button}
              disabled={changingEmail}
              onPress={() => setChangingPhone(true)}
            >
              <Text style={styles.buttonText}>
                {profile.phone ? 'Change phone number' : 'Add phone number'}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email address</Text>
        {!profile ? (
          <ActivityIndicator color={authTheme.brand} style={styles.loader} />
        ) : changingEmail ? (
          <EmailChangeSection currentEmail={profile.email} onDone={() => setChangingEmail(false)} />
        ) : (
          <>
            <Text style={styles.value}>{profile.email || 'No email yet'}</Text>
            <Text style={styles.hint}>
              We email a code to your current address and the new address.
            </Text>
            <Pressable
              style={styles.button}
              disabled={changingPhone}
              onPress={() => setChangingEmail(true)}
            >
              <Text style={styles.buttonText}>{profile.email ? 'Change email' : 'Add email'}</Text>
            </Pressable>
          </>
        )}
      </View>
    </ProfileFormLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: authTheme.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  value: {
    color: authTheme.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  loader: {
    marginTop: 12,
  },
  hint: {
    color: authTheme.textMuted,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  button: {
    marginTop: 16,
    backgroundColor: authTheme.brand,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
