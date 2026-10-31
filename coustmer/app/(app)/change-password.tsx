import { Redirect } from 'expo-router';

/** Legacy path — change password lives under Profile. */
export default function ChangePasswordRedirect() {
  return <Redirect href="/profile/change-password" />;
}
