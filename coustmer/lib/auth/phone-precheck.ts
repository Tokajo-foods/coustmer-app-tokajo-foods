import { getAuthErrorCode } from '@/lib/auth/http';
import { phoneAuthApi } from '@/lib/auth/phone-auth-api';
import { describePhoneAuthError } from '@/lib/auth/phone-auth-errors';
import type { PhoneCheckPurpose } from '@/lib/auth/types';

export type PhonePrecheckMiss = { code?: string; message: string };

/** `POST /auth/phone/check` before Firebase sends an SMS. `null` means the OTP may be sent. */
export async function precheckPhone(
  phone: string,
  purpose: PhoneCheckPurpose,
): Promise<PhonePrecheckMiss | null> {
  try {
    await phoneAuthApi.check(phone, purpose);
    return null;
  } catch (error) {
    return {
      code: getAuthErrorCode(error),
      message: describePhoneAuthError(error, 'Could not check this number. Try again.'),
    };
  }
}
