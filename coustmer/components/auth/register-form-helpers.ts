import { AuthApiError } from '@/lib/auth/http';
import { describePhoneAuthError } from '@/lib/auth/phone-auth-errors';

export type RegisterFocusField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'referralCode'
  | null;

export type RegisterFieldKey = Exclude<RegisterFocusField, null>;

const FIELD_KEYS: RegisterFieldKey[] = [
  'firstName',
  'lastName',
  'email',
  'password',
  'confirmPassword',
  'referralCode',
];

/** Map POST /auth/phone/register errors onto form fields where possible. */
export function mapRegisterApiError(error: unknown): {
  fields?: Partial<Record<RegisterFieldKey, string>>;
  message?: string;
} {
  if (error instanceof AuthApiError) {
    if (error.code === 'EMAIL_ALREADY_EXISTS') {
      return { fields: { email: describePhoneAuthError(error, error.message) } };
    }
    if (error.code?.includes('REFERRAL') || /referral/i.test(error.message)) {
      return { fields: { referralCode: error.message } };
    }
    if (error.status === 422 && error.fieldErrors) {
      const fields: Partial<Record<RegisterFieldKey, string>> = {};
      for (const [key, messages] of Object.entries(error.fieldErrors)) {
        const field = FIELD_KEYS.find((k) => k === key);
        if (field && messages?.[0]) fields[field] = messages[0];
      }
      if (Object.keys(fields).length > 0) return { fields };
    }
  }
  return { message: describePhoneAuthError(error, 'Could not create your account. Try again.') };
}
