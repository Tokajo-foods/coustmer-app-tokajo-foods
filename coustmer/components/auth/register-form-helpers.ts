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

export type RegisterStep =
  | 'email'
  | 'email_otp'
  | 'phone'
  | 'phone_otp'
  | 'details';

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

export function maskEmail(email: string) {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  if (at < 1) return trimmed;
  const name = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${'•'.repeat(Math.max(name.length - visible.length, 2))}${domain}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `+${digits.slice(0, 2)} •••• ••${digits.slice(-4)}`;
}
