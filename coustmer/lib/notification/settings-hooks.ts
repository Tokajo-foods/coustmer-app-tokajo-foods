import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationApi } from '@/lib/notification/api';
import { notificationKeys } from '@/lib/notification/hooks';
import { forgetCustomerPushDevice, getCustomerPushDeviceId } from '@/lib/notification/push-device';
import type { NotificationPreferences } from '@/lib/notification/types';

/** GET /devices — phones that receive this account's pushes, plus which one is this phone. */
export function useNotificationDevices(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.devices(),
    queryFn: async () => {
      const [devices, currentId] = await Promise.all([
        notificationApi.getDevices(),
        getCustomerPushDeviceId(),
      ]);
      return { devices, currentId };
    },
    enabled,
    staleTime: 30_000,
    retry: 1,
  });
}

/** DELETE /devices/:deviceId */
export function useUnregisterNotificationDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deviceId: string) => {
      await notificationApi.unregisterDevice(deviceId);
      if (deviceId === (await getCustomerPushDeviceId())) await forgetCustomerPushDevice();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.devices() }),
  });
}

/** GET /preferences */
export function useNotificationPreferences(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: notificationApi.getPreferences,
    enabled,
    staleTime: 15_000,
    retry: 1,
  });
}

/** PUT /preferences — flips the switch instantly, rolls back if the server refuses. */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const key = notificationKeys.preferences();
  return useMutation({
    mutationFn: (payload: Partial<NotificationPreferences>) =>
      notificationApi.updatePreferences(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationPreferences>(key);
      if (previous) queryClient.setQueryData(key, { ...previous, ...payload });
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSuccess: (saved) => queryClient.setQueryData(key, saved),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
