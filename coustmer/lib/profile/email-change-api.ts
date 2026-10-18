import { apiRequest, unwrapData, USERS_ME } from '@/lib/auth/http';

const EMAIL_CHANGE = `${USERS_ME}/contact/email`;

export type EmailOtpSent = { maskedTarget: string; cooldownSeconds: number };

function toOtpSent(raw: unknown): EmailOtpSent {
  const data = unwrapData<{ maskedTarget?: string; cooldownSeconds?: number }>(raw);
  return {
    maskedTarget: String(data?.maskedTarget ?? ''),
    cooldownSeconds: Number(data?.cooldownSeconds ?? 30) || 30,
  };
}

/** Settings email change: code to the current email (if any), then to the new one. */
export const emailChangeApi = {
  sendCurrent: async (): Promise<EmailOtpSent> =>
    toOtpSent(await apiRequest<unknown>(`${EMAIL_CHANGE}/send-current-otp`, { method: 'POST', body: {} })),

  verifyCurrent: async (otp: string): Promise<void> => {
    await apiRequest<unknown>(`${EMAIL_CHANGE}/verify-current`, { method: 'POST', body: { otp } });
  },

  sendNew: async (email: string): Promise<EmailOtpSent> =>
    toOtpSent(
      await apiRequest<unknown>(`${EMAIL_CHANGE}/send-new-otp`, { method: 'POST', body: { email } }),
    ),

  confirm: async (email: string, otp: string): Promise<void> => {
    await apiRequest<unknown>(`${EMAIL_CHANGE}/confirm`, { method: 'POST', body: { email, otp } });
  },
};
