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
  if (!E164_REGEX.test(phone)) return 'Enter a 10-digit mobile or a full number with country code';
  return null;
}

export function formatPhoneForDisplay(phoneE164: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(phoneE164);
  return m ? `+91 ${m[1]} ${m[2]}` : phoneE164;
}
