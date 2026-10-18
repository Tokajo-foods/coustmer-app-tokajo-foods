import { Redirect } from 'expo-router';

/** Old deep link. Phone OTP now lives inside the sign-in sheet. */
export default function VerifyOtpPage() {
  return <Redirect href={{ pathname: '/', params: { auth: 'login' } }} />;
}
