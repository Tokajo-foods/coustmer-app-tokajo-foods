import { normalizeIndianPhoneInput, validateIndianPhone } from '@/utils/validation';

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

/** 10-digit Indian mobile (6-9…) → +91…; otherwise strip spaces/dashes and keep E.164. */
export function normalizePhoneE164(value: string): string {
  return normalizeIndianPhoneInput(value.trim().replace(/[()\s.-]/g, ''));
}

export function validatePhoneE164(value: string): string | null {
  const phone = normalizePhoneE164(value);
  if (!phone) return 'Enter your mobile number';
  if (phone.startsWith('+91')) return validateIndianPhone(phone, true);
  if (/^\d{10}$/.test(phone)) return 'Indian mobile numbers start with 6, 7, 8 or 9';
  if (!E164_REGEX.test(phone)) return 'Enter your 10-digit mobile number';
  return null;
}

/** Any typed, pasted or autofilled Indian number (+91 / 91 / 0 prefix) → up to 10 local digits. */
export function toIndianLocalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  const hasCountryCode = raw.trim().startsWith('+') || digits.length >= 12;
  if (hasCountryCode && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  // An extra keystroke past 10 digits is dropped, not treated as a prefix.
  return digits.slice(0, 10);
}

/** "9876543210" → "98765 43210" while typing. */
export function formatIndianLocal(digits: string): string {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

export function formatPhoneForDisplay(phoneE164: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(phoneE164);
  return m ? `+91 ${m[1]} ${m[2]}` : phoneE164;
}
