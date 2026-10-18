import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { profileApi } from '@/lib/profile/api';
import type {
  ApplyReferralPayload,
  DeleteAccountPayload,
  DietaryPreferences,
  LanguagePreferencePayload,
  NotificationPreferences,
  RegisterDevicePayload,
  UpdateEmailPayload,
  UpdateProfilePayload,
} from '@/lib/profile/types';
import { setStoredUser } from '@/lib/auth/storage';
import type { AuthUser } from '@/lib/auth/types';
import { useAuthStore } from '@/store/auth-store';

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  preferences: () => [...profileKeys.all, 'preferences'] as const,
  sessions: () => [...profileKeys.all, 'sessions'] as const,
  devices: () => [...profileKeys.all, 'devices'] as const,
  referral: () => [...profileKeys.all, 'referral'] as const,
};

function syncAuthUser(profile: {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isEmailVerified?: boolean;
}) {
  const authUser: AuthUser = {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    emailVerified: profile.isEmailVerified,
  };
  useAuthStore.setState({ user: authUser });
  void setStoredUser(authUser);
}

export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: profileApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileApi.updateProfile(payload),
    onSuccess: (data) => {
      syncAuthUser(data);
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (payload: DeleteAccountPayload) =>
      profileApi.deleteAccount(payload),
  });
}

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      uri,
      fileName,
      mimeType,
    }: {
      uri: string;
      fileName: string;
      mimeType: string;
    }) => profileApi.uploadProfilePhoto(uri, fileName, mimeType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

export function useDeleteProfilePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.deleteProfilePhoto,
    onSuccess: (data) => {
      syncAuthUser(data);
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: profileKeys.preferences(),
    queryFn: profileApi.getPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationPreferences) =>
      profileApi.updateNotificationPreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.preferences() });
    },
  });
}

export function useUpdateDietaryPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DietaryPreferences) =>
      profileApi.updateDietaryPreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.preferences() });
    },
  });
}

export function useUpdateLanguagePreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LanguagePreferencePayload) =>
      profileApi.updateLanguagePreference(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.preferences() });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

export function useUpdateEmail() {
  return useMutation({
    mutationFn: (payload: UpdateEmailPayload) => profileApi.updateEmail(payload),
  });
}

export function useSessions() {
  return useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: profileApi.getSessions,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => profileApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() });
    },
  });
}

export function useDevices() {
  return useQuery({
    queryKey: profileKeys.devices(),
    queryFn: profileApi.getDevices,
  });
}

export function useRegisterDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterDevicePayload) =>
      profileApi.registerDevice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.devices() });
    },
  });
}

export function useRemoveDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => profileApi.removeDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.devices() });
    },
  });
}

export function useReferral() {
  return useQuery({
    queryKey: profileKeys.referral(),
    queryFn: profileApi.getReferral,
  });
}

export function useApplyReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyReferralPayload) =>
      profileApi.applyReferral(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.referral() });
    },
  });
}
