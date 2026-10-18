import {
  apiRequest,
  AUTH_BASE,
  ensureCustomerAuth,
  normalizeAuthResponse,
  normalizeMessageResponse,
} from '@/lib/auth/http';
import type {
  LoginPayload,
  OtpSendPayload,
  OtpVerifyPayload,
  ResetPasswordPayload,
} from '@/lib/auth/types';
import { isPartnerRole } from '@/lib/auth/types';

export { AuthApiError, getAuthErrorCode, SESSION_AUTH_TOKEN } from '@/lib/auth/http';

export const authApi = {
  login: async (payload: LoginPayload) => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/login`, {
      method: 'POST',
      body: payload,
    });
    return ensureCustomerAuth(normalizeAuthResponse(data));
  },

  sendOtp: async (payload: OtpSendPayload) => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/otp/send`, {
      method: 'POST',
      body: {
        identifier: payload.emailOrPhone,
        purpose: payload.purpose ?? 'login',
        ...(payload.purpose === 'register' ? { role: 'customer' } : {}),
      },
    });
    return normalizeMessageResponse(data);
  },

  verifyOtp: async (payload: OtpVerifyPayload) => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/otp/verify`, {
      method: 'POST',
      body: {
        identifier: payload.emailOrPhone,
        otp: payload.otp,
        purpose: payload.purpose ?? 'login',
      },
    });
    return ensureCustomerAuth(normalizeAuthResponse(data));
  },

  /** Email reset step 2: confirm the forgot_password code sent by `sendOtp`. */
  confirmForgotPasswordOtp: async (identifier: string, otp: string) => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/otp/confirm-forgot-password`, {
      method: 'POST',
      body: { identifier, otp },
    });
    return normalizeMessageResponse(data);
  },

  /** Reset link token, or the email confirmed above. Phone reset uses phoneAuthApi. */
  resetPassword: async (payload: ResetPasswordPayload) => {
    const body = payload.token?.trim()
      ? { token: payload.token.trim(), newPassword: payload.password }
      : { identifier: payload.identifier?.trim() ?? '', newPassword: payload.password };
    const data = await apiRequest<unknown>(`${AUTH_BASE}/reset-password`, {
      method: 'POST',
      body,
    });
    return normalizeMessageResponse(data);
  },

  verifyEmail: async (token: string) => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/email/verify/${token}`);
    return normalizeMessageResponse(data);
  },

  logout: async () => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/logout`, { method: 'POST' });
    return normalizeMessageResponse(data);
  },

  logoutAll: async () => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/logout-all`, { method: 'POST' });
    return normalizeMessageResponse(data);
  },

  resendEmailVerification: async () => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/email/send-verify`, {
      method: 'POST',
    });
    return normalizeMessageResponse(data);
  },

  /** True when a stored/session user must not use the customer app. */
  isBlockedPartnerRole: isPartnerRole,
};
