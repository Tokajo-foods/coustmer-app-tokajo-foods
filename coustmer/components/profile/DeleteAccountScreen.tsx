import { useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { authTheme } from '@/constants/auth-theme';
import { loadNotifications } from '@/lib/notification/load-notifications';
import {
  registerCustomerPushDevice,
  unregisterCustomerPushDevice,
} from '@/lib/notification/push-device';
import { useDeleteAccount } from '@/lib/profile/hooks';
import { useAuthStore } from '@/store/auth-store';

/** Deletion failed after unbinding — put this phone back on the account's pushes. */
async function restorePushRegistration(): Promise<void> {
  const N = await loadNotifications();
  if (!N) return;
  const { status } = await N.getPermissionsAsync().catch(() => ({ status: 'denied' as const }));
  if (status === 'granted') await registerCustomerPushDevice(N).catch(() => null);
}

export function DeleteAccountScreen() {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const clearSession = useAuthStore((s) => s.clearSession);

  const [reason, setReason] = useState('');
  const [banner, setBanner] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  const handleDelete = () => {
    if (reason.trim().length < 5) {
      setBanner({
        message: 'Please tell us why you are leaving (min 5 characters)',
        type: 'error',
      });
      return;
    }

    setBanner(null);
    const run = async () => {
      // Unbind this phone while the session is still valid; a deleted account cannot do it later.
      await unregisterCustomerPushDevice();
      deleteAccount.mutate(
        { reason: reason.trim() },
        {
          onSuccess: async (message) => {
            await clearSession();
            setBanner({ message, type: 'success' });
            setTimeout(() => router.replace('/login'), 1500);
          },
          onError: (error) => {
            void restorePushRegistration();
            setBanner({
              message: error instanceof Error ? error.message : 'Deletion failed',
              type: 'error',
            });
          },
        }
      );
    };
    void run();
  };

  return (
    <ProfileFormLayout
      title="Delete account"
      subtitle="This action cannot be undone easily"
      banner={banner}
      onSave={handleDelete}
      saveLabel={deleteAccount.isPending ? 'Deleting…' : 'Delete my account'}
      saving={deleteAccount.isPending}
    >
      <View style={styles.warning}>
        <AlertTriangle color={authTheme.error} size={24} />
        <Text style={styles.warningTitle}>Permanent account deletion</Text>
        <Text style={styles.warningText}>
          Your data will be scheduled for removal within 30 days. You will be
          logged out immediately.
        </Text>
      </View>

      <AuthInput
        label="Reason for leaving"
        value={reason}
        onChangeText={setReason}
        placeholder="Tell us why you're deleting your account…"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </ProfileFormLayout>
  );
}

const styles = StyleSheet.create({
  warning: {
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    padding: 20,
    marginBottom: 20,
    gap: 8,
  },
  warningTitle: {
    color: authTheme.error,
    fontSize: 16,
    fontWeight: '800',
  },
  warningText: {
    color: authTheme.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
