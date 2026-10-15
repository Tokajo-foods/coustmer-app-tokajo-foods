import axios from 'axios';

import { api, assertApiBaseUrl } from '@/lib/api';
import type { AuthResponse, AuthUser, MessageResponse } from '@/lib/auth/types';
import { assertCustomerAccount, normalizeUserRole } from '@/lib/auth/types';

/** Live API mounts auth under user-service (not /auth at root). */
export const AUTH_BASE = '/api/v1/user-service/auth';
export const USERS_ME = '/api/v1/user-service/users/me';

/** Cookie session auth — no JWT in response body. */
export const SESSION_AUTH_TOKEN = 'session';

/** Carries the backend `code` (e.g. USER_NOT_FOUND) so screens can branch on it. */
export class AuthApiError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    opts: { code?: string; status?: number; fieldErrors?: Record<string, string[]> } = {},
  ) {
    super(message);
    this.name = 'AuthApiError';
    this.code = opts.code;
    this.status = opts.status;
    this.fieldErrors = opts.fieldErrors;
  }
}

export function getAuthErrorCode(error: unknown): string | undefined {
  return error instanceof AuthApiError ? error.code : undefined;
}

export function mapApiUser(data: Record<string, unknown>): AuthUser {
  const emailRaw = data.email != null ? String(data.email).trim() : '';
  const phoneRaw = data.phone != null ? String(data.phone).trim() : '';
  return {
    id: String(data._id ?? data.id ?? ''),
    email: emailRaw,
    firstName: (data.firstName as string) || undefined,
    lastName: (data.lastName as string) || undefined,
    phone: phoneRaw || undefined,
    role:
      normalizeUserRole(data.role ?? data.userType ?? data.type ?? data.accountType) ||
      undefined,
    emailVerified: Boolean(data.isEmailVerified ?? data.emailVerified ?? false),
    phoneVerified: Boolean(data.isPhoneVerified ?? false),
  };
}

export function normalizeAuthResponse(data: unknown): AuthResponse {
  const payload = data as Record<string, unknown>;
  const nested = payload.data as Record<string, unknown> | undefined;

  const token =
    (payload.token as string) ||
    (payload.accessToken as string) ||
    (payload.access_token as string) ||
    (nested?.token as string) ||
    (nested?.accessToken as string) ||
    SESSION_AUTH_TOKEN;

  const userSource = (nested?.user ?? nested ?? payload.user ?? payload) as Record<
    string,
    unknown
  >;
  const user = mapApiUser(userSource);

  if (!user.id || (!user.email && !user.phone)) {
    throw new AuthApiError('Invalid authentication response from server');
  }

  return { token, user, message: payload.message as string | undefined };
}

export function normalizeMessageResponse(data: unknown): MessageResponse {
  const payload = data as { message?: string };
  return { message: payload.message ?? 'Success' };
}

/** Unwrap `{ success, data }` envelopes. */
export function unwrapData<T>(data: unknown): T {
  const payload = data as { data?: T } | null;
  return (payload?.data ?? payload) as T;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  const payload = data as {
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
  } | null;

  if (payload?.errors && typeof payload.errors === 'object') {
    const details = Object.values(payload.errors).flat().filter(Boolean);
    if (details.length > 0) return details.join('\n');
  }

  return payload?.message || payload?.error || fallback;
}

export async function apiRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  const { method = 'GET', body } = options;

  assertApiBaseUrl();

  try {
    const response = await api.request<T>({
      url: path,
      method,
      data: body,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;

    if (!error.response) {
      throw new AuthApiError(
        'Network request failed. Check your internet connection and try again.',
        { code: 'NETWORK_ERROR' },
      );
    }

    const status = error.response.status;
    const data = error.response.data as { code?: string; errors?: unknown } | undefined;
    const message = extractErrorMessage(data, `Request failed (${status})`);
    const fieldErrors =
      data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)
        ? (data.errors as Record<string, string[]>)
        : undefined;

    if (message.toLowerCase().includes('csrf')) {
      throw new AuthApiError('Security token expired. Close and reopen the app, then try again.', {
        code: 'CSRF_INVALID',
        status,
      });
    }

    throw new AuthApiError(message, { code: data?.code, status, fieldErrors });
  }
}

/** Best-effort logout so a rejected partner session is not left open. */
async function revokeSessionQuietly() {
  try {
    await apiRequest<unknown>(`${AUTH_BASE}/logout`, { method: 'POST' });
  } catch {
    // ignore
  }
}

/** Ensure the authenticated account is a customer; fetch /users/me when role is missing. */
export async function ensureCustomerAuth(response: AuthResponse): Promise<AuthResponse> {
  let role = response.user.role;

  if (!role) {
    try {
      const me = await apiRequest<{ data?: Record<string, unknown>; role?: string }>(USERS_ME);
      const source = (me.data ?? me) as Record<string, unknown>;
      role =
        normalizeUserRole(source.role ?? source.userType ?? source.type ?? source.accountType) ||
        undefined;
    } catch {
      // keep going with whatever we have
    }
  }

  try {
    assertCustomerAccount(role);
  } catch (error) {
    await revokeSessionQuietly();
    throw error;
  }

  return { ...response, user: { ...response.user, role: role || 'customer' } };
}
