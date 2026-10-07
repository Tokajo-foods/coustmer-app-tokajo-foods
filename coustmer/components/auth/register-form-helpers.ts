export type RegisterFocusField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword'
  | 'referralCode'
  | 'otp'
  | null;

export type RegisterFieldKey = Exclude<RegisterFocusField, null>;

export function mapRegisterApiError(
  message: string,
): { field?: RegisterFieldKey; message: string } {
  const lower = message.toLowerCase();

  if (lower.includes('confirm') || lower.includes('match') || lower.includes('re-enter')) {
    return { field: 'confirmPassword', message };
  }
  if (
    lower.includes('password') ||
    lower.includes('digit') ||
    lower.includes('uppercase') ||
    lower.includes('special') ||
    lower.includes('character')
  ) {
    return { field: 'password', message };
  }
  if (lower.includes('email')) return { field: 'email', message };
  if (lower.includes('phone')) return { field: 'phone', message };
  if (lower.includes('otp') || lower.includes('code')) return { field: 'otp', message };
  if (lower.includes('first name') || lower.includes('firstname')) {
    return { field: 'firstName', message };
  }
  if (lower.includes('last name') || lower.includes('lastname')) {
    return { field: 'lastName', message };
  }
  if (lower.includes('referral')) {
    return { field: 'referralCode', message };
  }

  return { message };
}
