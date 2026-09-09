import axios from 'axios';

import { api, refreshCsrfToken } from '@/lib/api';
import type {
  AddWalletPayload,
  ApplyReferralPayload,
  DeleteAccountPayload,
  DietaryPreferences,
  LanguagePreferencePayload,
  NotificationPreferences,
  ReferralInfo,
  RegisterDevicePayload,
  UpdateEmailPayload,
  UpdatePhonePayload,
  UpdateProfilePayload,
  UserDevice,
  UserPreferences,
  UserProfile,
  UserSession,
  WalletSummary,
  WalletTransactionsResponse,
} from '@/lib/profile/types';

const USERS_BASE = '/api/v1/user-service/users/me';

type Envelope<T> = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
};

async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<Envelope<T>> {
  const { method = 'GET', body, headers } = options;

  try {
    const response = await api.request<Envelope<T>>({
      url: path,
      method,
      data: body,
      headers,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          'Network request failed. Check your internet connection and try again.'
        );
      }

      const data = error.response.data as
        | { message?: string; error?: string; errors?: Record<string, string[]> }
        | undefined;

      if (data?.errors) {
        const details = Object.values(data.errors).flat().filter(Boolean);
        if (details.length > 0) {
          throw new Error(details.join('\n'));
        }
      }

      const message =
        data?.message || data?.error || `Request failed (${error.response.status})`;

      if (message.toLowerCase().includes('csrf')) {
        throw new Error(
          'Security token expired. Close and reopen the app, then try again.'
        );
      }

      throw new Error(message);
    }

    throw error;
  }
}

function mapProfile(data: Record<string, unknown>): UserProfile {
  return {
    id: String(data._id ?? data.id ?? ''),
    email: String(data.email ?? ''),
    phone: (data.phone as string) || undefined,
    firstName: (data.firstName as string) || undefined,
    lastName: (data.lastName as string) || undefined,
    displayName: (data.displayName as string) || undefined,
    bio: (data.bio as string) || undefined,
    gender: (data.gender as string) || undefined,
    dateOfBirth: (data.dateOfBirth as string) || undefined,
    language: (data.language as string) || undefined,
    role: (data.role as string) || undefined,
    profilePhotoUrl:
      (data.profilePhotoUrl as string) ||
      (data.profilePhoto as string) ||
      undefined,
    isEmailVerified: Boolean(data.isEmailVerified ?? data.emailVerified ?? false),
    isPhoneVerified: Boolean(data.isPhoneVerified ?? data.phoneVerified ?? false),
  };
}

function mapSession(data: Record<string, unknown>): UserSession {
  return {
    id: String(data._id ?? data.id ?? data.sessionId ?? ''),
    deviceName: (data.deviceName as string) || undefined,
    deviceType: (data.deviceType as string) || undefined,
    ipAddress: (data.ipAddress as string) || undefined,
    lastActive: (data.lastActive as string) || (data.updatedAt as string),
    isCurrent: Boolean(data.isCurrent ?? false),
  };
}

function mapDevice(data: Record<string, unknown>): UserDevice {
  return {
    id: String(data._id ?? data.id ?? ''),
    deviceId: String(data.deviceId ?? ''),
    deviceType: String(data.deviceType ?? ''),
    deviceName: (data.deviceName as string) || undefined,
    platform: (data.platform as string) || undefined,
    lastSeen: (data.lastSeen as string) || (data.updatedAt as string),
  };
}

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await request<Record<string, unknown>>(USERS_BASE);
    return mapProfile(res.data ?? {});
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const res = await request<Record<string, unknown>>(USERS_BASE, {
      method: 'PUT',
      body: payload,
    });
    return mapProfile(res.data ?? {});
  },

  deleteAccount: async (payload: DeleteAccountPayload): Promise<string> => {
    const res = await request<unknown>(USERS_BASE, {
      method: 'DELETE',
      body: payload,
    });
    return res.message ?? 'Account deletion initiated';
  },

  uploadProfilePhoto: async (uri: string, fileName: string, mimeType: string) => {
    const token = await refreshCsrfToken(true);
    const formData = new FormData();
    formData.append('photo', {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    const response = await api.post<Envelope<Record<string, unknown>>>(
      `${USERS_BASE}/profile-photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-Token': token,
        },
        withCredentials: true,
      }
    );

    return mapProfile(response.data.data ?? {});
  },

  deleteProfilePhoto: async (): Promise<UserProfile> => {
    const res = await request<Record<string, unknown>>(
      `${USERS_BASE}/profile-photo`,
      { method: 'DELETE' }
    );
    return mapProfile(res.data ?? {});
  },

  getPreferences: async (): Promise<UserPreferences> => {
    const res = await request<UserPreferences>(`${USERS_BASE}/preferences`);
    return {
      notificationPreferences: res.data?.notificationPreferences ?? {},
      dietaryPreferences: res.data?.dietaryPreferences ?? {},
    };
  },

  updateNotificationPreferences: async (
    payload: NotificationPreferences
  ): Promise<UserProfile> => {
    const res = await request<Record<string, unknown>>(
      `${USERS_BASE}/preferences/notifications`,
      { method: 'PUT', body: payload }
    );
    return mapProfile(res.data ?? {});
  },

  updateDietaryPreferences: async (
    payload: DietaryPreferences
  ): Promise<UserProfile> => {
    const res = await request<Record<string, unknown>>(
      `${USERS_BASE}/preferences/dietary`,
      { method: 'PUT', body: payload }
    );
    return mapProfile(res.data ?? {});
  },

  updateLanguagePreference: async (
    payload: LanguagePreferencePayload
  ): Promise<UserProfile> => {
    const res = await request<Record<string, unknown>>(
      `${USERS_BASE}/preferences/language`,
      { method: 'PUT', body: payload }
    );
    return mapProfile(res.data ?? {});
  },

  updatePhone: async (payload: UpdatePhonePayload): Promise<string> => {
    const res = await request<unknown>(`${USERS_BASE}/phone`, {
      method: 'PUT',
      body: payload,
    });
    return res.message ?? 'Phone update initiated';
  },

  updateEmail: async (payload: UpdateEmailPayload): Promise<string> => {
    const res = await request<unknown>(`${USERS_BASE}/email`, {
      method: 'PUT',
      body: payload,
    });
    return res.message ?? 'Verification email sent';
  },

  getWallet: async (): Promise<WalletSummary> => {
    const res = await request<WalletSummary>(`${USERS_BASE}/wallet`);
    return {
      balance: Number(res.data?.balance ?? 0),
      currency: String(res.data?.currency ?? 'INR'),
      isLocked: Boolean(res.data?.isLocked ?? false),
      lastCredited: res.data?.lastCredited,
    };
  },

  getWalletTransactions: async (): Promise<WalletTransactionsResponse> => {
    const res = await request<WalletTransactionsResponse>(
      `${USERS_BASE}/wallet/transactions`
    );
    const data = res.data;
    return {
      data: Array.isArray(data?.data) ? data.data : [],
      total: Number(data?.total ?? 0),
      page: Number(data?.page ?? 1),
      limit: Number(data?.limit ?? 20),
      totalPages: Number(data?.totalPages ?? 0),
    };
  },

  addWalletMoney: async (payload: AddWalletPayload): Promise<WalletSummary> => {
    const res = await request<WalletSummary>(`${USERS_BASE}/wallet/add`, {
      method: 'POST',
      body: payload,
    });
    return {
      balance: Number(res.data?.balance ?? 0),
      currency: String(res.data?.currency ?? 'INR'),
      isLocked: Boolean(res.data?.isLocked ?? false),
      lastCredited: res.data?.lastCredited,
    };
  },

  getSessions: async (): Promise<UserSession[]> => {
    const res = await request<Record<string, unknown>[]>(`${USERS_BASE}/sessions`);
    return Array.isArray(res.data) ? res.data.map(mapSession) : [];
  },

  revokeSession: async (sessionId: string): Promise<string> => {
    const res = await request<unknown>(`${USERS_BASE}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return res.message ?? 'Session revoked';
  },

  getDevices: async (): Promise<UserDevice[]> => {
    const res = await request<Record<string, unknown>[]>(`${USERS_BASE}/devices`);
    return Array.isArray(res.data) ? res.data.map(mapDevice) : [];
  },

  registerDevice: async (payload: RegisterDevicePayload): Promise<string> => {
    const res = await request<unknown>(`${USERS_BASE}/devices`, {
      method: 'POST',
      body: payload,
    });
    return res.message ?? 'Device registered';
  },

  removeDevice: async (deviceId: string): Promise<string> => {
    const res = await request<unknown>(`${USERS_BASE}/devices/${deviceId}`, {
      method: 'DELETE',
    });
    return res.message ?? 'Device removed';
  },

  getReferral: async (): Promise<ReferralInfo> => {
    const res = await request<ReferralInfo>(`${USERS_BASE}/referral`);
    const d = res.data;
    return {
      referralCode: String(d?.referralCode ?? ''),
      referralCount: Number(d?.referralCount ?? 0),
      hasApplied: Boolean(d?.hasApplied ?? d?.referredBy),
      referredBy: d?.referredBy,
      program: d?.program
        ? {
            isActive: Boolean(d.program.isActive),
            referrerBonusInr: Number(d.program.referrerBonusInr ?? 0),
            refereeBonusInr: Number(d.program.refereeBonusInr ?? 0),
          }
        : undefined,
    };
  },

  applyReferral: async (payload: ApplyReferralPayload): Promise<string> => {
    const res = await request<unknown>(`${USERS_BASE}/referral/apply`, {
      method: 'POST',
      body: payload,
    });
    return res.message ?? 'Referral code applied';
  },
};
