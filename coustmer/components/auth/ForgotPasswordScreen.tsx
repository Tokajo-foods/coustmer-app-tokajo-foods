import { useRouter } from 'expo-router';

import { ForgotPasswordFormContent } from '@/components/auth/ForgotPasswordFormContent';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';

const SUBTITLE = 'Use an email code or phone OTP to set a new password.';

/** Full-screen reset — not the auth bottom sheet (avoids sheet + keyboard jitter). */
export function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <ProfileFormLayout title="Forgot password" subtitle={SUBTITLE} backFallback="/" scrollable={false}>
      <ForgotPasswordFormContent
        layout="screen"
        onBackToLogin={() => router.replace('/?auth=login')}
      />
    </ProfileFormLayout>
  );
}
