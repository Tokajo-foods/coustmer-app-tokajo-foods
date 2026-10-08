import { Redirect, useLocalSearchParams } from 'expo-router';

export default function VerifyOtpPage() {
  const { identifier, verificationId } = useLocalSearchParams<{
    identifier?: string;
    verificationId?: string;
  }>();

  return (
    <Redirect
      href={{
        pathname: '/',
        params: {
          auth: 'verify-otp',
          ...(identifier ? { identifier: String(identifier) } : {}),
          ...(verificationId ? { verificationId: String(verificationId) } : {}),
        },
      }}
    />
  );
}
