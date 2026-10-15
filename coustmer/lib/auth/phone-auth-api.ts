import { Platform } from 'react-native';

import {
  apiRequest,
  AUTH_BASE,
  AuthApiError,
  ensureCustomerAuth,
  normalizeAuthResponse,
  normalizeMessageResponse,
  unwrapData,
} from '@/lib/auth/http';
import type {
  PhoneAuthStatus,
  PhoneForgotPasswordResult,
  PhoneLoginPayload,
  PhoneRegisterPayload,
} from '@/lib/auth/types';

const PHONE_BASE = `${AUTH_BASE}/phone`;
const CUSTOMER_ROLE = 'customer';

function clientSource(): 'ios' | 'android' | 'web' {
  if (Platform.OS === 'ios' || Platform.OS === 'android') return Platform.OS;
  return 'web';
}

export const phoneAuthApi = {
  status: async (): Promise<PhoneAuthStatus> => {
    const raw = unwrapData<Partial<PhoneAuthStatus>>(
      await apiRequest<unknown>(`${PHONE_BASE}/status`),
    );
    return {
      firebaseConfigured: Boolean(raw?.firebaseConfigured),
      provider: String(raw?.provider ?? 'firebase'),
      otpLength: Number(raw?.otpLength ?? 6),
      resendCooldownSeconds: Number(raw?.resendCooldownSeconds ?? 30),
      tokenMaxAgeSeconds: Number(raw?.tokenMaxAgeSeconds ?? 600),
    };
  },

  login: async ({ idToken, phone }: PhoneLoginPayload) => {
    const data = await apiRequest<unknown>(`${PHONE_BASE}/login`, {
      method: 'POST',
      body: { idToken, role: CUSTOMER_ROLE, ...(phone ? { phone } : {}) },
    });
    return ensureCustomerAuth(normalizeAuthResponse(data));
  },

  register: async (payload: PhoneRegisterPayload) => {
    const email = payload.email?.trim().toLowerCase();
    const lastName = payload.lastName?.trim();
    const referralCode = payload.referralCode?.trim().toUpperCase();
    const data = await apiRequest<unknown>(`${PHONE_BASE}/register`, {
      method: 'POST',
      body: {
        idToken: payload.idToken,
        role: CUSTOMER_ROLE,
        phone: payload.phone,
        firstName: payload.firstName.trim(),
        source: clientSource(),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email } : {}),
        ...(payload.password ? { password: payload.password } : {}),
        ...(referralCode ? { referralCode } : {}),
      },
    });
    return ensureCustomerAuth(normalizeAuthResponse(data));
  },

  forgotPassword: async ({
    idToken,
    phone,
  }: PhoneLoginPayload): Promise<PhoneForgotPasswordResult> => {
    const raw = unwrapData<Partial<PhoneForgotPasswordResult>>(
      await apiRequest<unknown>(`${PHONE_BASE}/forgot-password`, {
        method: 'POST',
        body: { idToken, ...(phone ? { phone } : {}) },
      }),
    );
    if (!raw?.resetToken) {
      throw new AuthApiError('Server did not return a reset token. Try again.');
    }
    return {
      resetToken: String(raw.resetToken),
      expiresInSeconds: Number(raw.expiresInSeconds ?? 600),
      phone: String(raw.phone ?? ''),
    };
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    const data = await apiRequest<unknown>(`${PHONE_BASE}/reset-password`, {
      method: 'POST',
      body: { resetToken, newPassword },
    });
    return normalizeMessageResponse(data);
  },
};
