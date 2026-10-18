import { Pressable } from '@/components/common/Pressable';
import { useEffect, useState } from 'react';
import { ActivityIndicator,
  
  StyleSheet,
  Text,
  View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { PhoneChangeSection } from '@/components/profile/PhoneChangeSection';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { authTheme } from '@/constants/auth-theme';
import { formatPhoneForDisplay } from '@/lib/auth/phone-number';
import { useUpdateEmail, useUserProfile } from '@/lib/profile/hooks';

export function ContactScreen() {
  const { data: profile } = useUserProfile();
  const updateEmail = useUpdateEmail();

  const [changingPhone, setChangingPhone] = useState(false);
  const [email, setEmail] = useState('');
  const [banner, setBanner] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  useEffect(() => {
    if (!profile) return;
    setEmail(profile.email ?? '');
  }, [profile]);

  const handleUpdateEmail = () => {
    setBanner(null);
    updateEmail.mutate(
      { email: email.trim() },
      {
        onSuccess: (message) => setBanner({ message, type: 'success' }),
        onError: (error) =>
          setBanner({
            message: error instanceof Error ? error.message : 'Update failed',
            type: 'error',
          }),
      }
    );
  };

  return (
    <ProfileFormLayout
      title="Phone & email"
      subtitle="Updates may require verification"
      banner={banner}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phone number</Text>
        {!profile ? (
          <ActivityIndicator color={authTheme.brand} style={styles.loader} />
        ) : changingPhone ? (
          <PhoneChangeSection
            currentPhone={profile.phone}
            onDone={() => setChangingPhone(false)}
          />
        ) : (
          <>
            <Text style={styles.value}>
              {profile.phone ? formatPhoneForDisplay(profile.phone) : 'No phone number yet'}
            </Text>
            <Text style={styles.hint}>
              We verify your current number and the new number with an OTP.
            </Text>
            <Pressable style={styles.button} onPress={() => setChangingPhone(true)}>
              <Text style={styles.buttonText}>
                {profile.phone ? 'Change phone number' : 'Add phone number'}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email address</Text>
        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.hint}>
          A verification link will be sent to your new email.
        </Text>
        <Pressable
          style={styles.button}
          onPress={handleUpdateEmail}
          disabled={updateEmail.isPending}
        >
          {updateEmail.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Update email</Text>
          )}
        </Pressable>
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
