import {
  apiRequest,
  AUTH_BASE,
  AuthApiError,
  unwrapData,
  USERS_ME,
} from '@/lib/auth/http';
import type { PasswordChangeStart } from '@/lib/auth/types';

const PHONE_CHANGE = `${USERS_ME}/contact/phone`;
const PASSWORD_CHANGE = `${AUTH_BASE}/password/change`;

/** Settings: Firebase phone change. */
export const phoneChangeApi = {
  /** Step 1 — Firebase ID token for the number currently on the account. */
  verifyCurrent: async (idToken: string): Promise<void> => {
    await apiRequest<unknown>(`${PHONE_CHANGE}/verify-current-firebase`, {
      method: 'POST',
      body: { idToken },
    });
  },

  /** Step 2 — Firebase ID token for the new number. Returns the saved E.164 phone. */
  confirmNew: async (idToken: string): Promise<string> => {
    const raw = unwrapData<{ phone?: string }>(
      await apiRequest<unknown>(`${PHONE_CHANGE}/confirm-firebase`, {
        method: 'POST',
        body: { idToken },
      }),
    );
    return String(raw?.phone ?? '');
  },
};

/** Settings: password change after email + phone OTP. */
export const passwordChangeApi = {
  start: async (): Promise<PasswordChangeStart> => {
    const raw = unwrapData<Partial<PasswordChangeStart>>(
      await apiRequest<unknown>(`${PASSWORD_CHANGE}/start`, { method: 'POST', body: {} }),
    );
    return {
      emailRequired: Boolean(raw?.emailRequired),
      phoneRequired: Boolean(raw?.phoneRequired),
      maskedEmail: raw?.maskedEmail ? String(raw.maskedEmail) : null,
      phone: raw?.phone ? String(raw.phone) : null,
      maskedPhone: raw?.maskedPhone ? String(raw.maskedPhone) : null,
      emailOtpSent: Boolean(raw?.emailOtpSent),
      cooldownSeconds: Number(raw?.cooldownSeconds ?? 30),
    };
  },

  verify: async (input: { emailOtp?: string; phoneIdToken?: string }): Promise<string> => {
    const raw = unwrapData<{ changeToken?: string }>(
      await apiRequest<unknown>(`${PASSWORD_CHANGE}/verify`, {
        method: 'POST',
        body: {
          ...(input.emailOtp ? { emailOtp: input.emailOtp } : {}),
          ...(input.phoneIdToken ? { phoneIdToken: input.phoneIdToken } : {}),
        },
      }),
    );
    if (!raw?.changeToken) {
      throw new AuthApiError('Server did not return a change token. Try again.');
    }
    return raw.changeToken;
  },

  confirm: async (changeToken: string, newPassword: string): Promise<void> => {
    await apiRequest<unknown>(`${PASSWORD_CHANGE}/confirm`, {
      method: 'POST',
      body: { changeToken, newPassword },
    });
  },
};
