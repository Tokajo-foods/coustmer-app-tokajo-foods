import {
  apiRequest,
  AUTH_BASE,
  ensureCustomerAuth,
  normalizeAuthResponse,
  normalizeMessageResponse,
} from '@/lib/auth/http';
import type {
  ChangePasswordPayload,
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

  /** Legacy emailed reset link (`/reset-password?token=`). Phone reset uses phoneAuthApi. */
  resetPassword: async (payload: ResetPasswordPayload) => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/reset-password`, {
      method: 'POST',
      body: { token: payload.token.trim(), newPassword: payload.password },
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

  changePassword: async (payload: ChangePasswordPayload) => {
    const data = await apiRequest<unknown>(`${AUTH_BASE}/change-password`, {
      method: 'POST',
      body: {
        currentPassword: payload.oldPassword,
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword ?? payload.newPassword,
      },
    });
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
