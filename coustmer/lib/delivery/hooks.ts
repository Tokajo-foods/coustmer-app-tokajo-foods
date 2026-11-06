import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deliveryApi } from '@/lib/delivery/api';
import { errorStatus } from '@/lib/delivery/http';
import type {
  AddressChangePayload,
  ContactlessPayload,
  DeliveryInstructionsPayload,
  RatePartnerPayload,
  TrackingSupportReason,
  TrackingTipPayload,
} from '@/lib/delivery/types';

export const deliveryKeys = {
  all: ['delivery'] as const,
  tracking: (orderId: string) => [...deliveryKeys.all, 'tracking', orderId] as const,
  riderLocation: (orderId: string) => [...deliveryKeys.tracking(orderId), 'location'] as const,
  dropOtp: (orderId: string) => [...deliveryKeys.all, 'drop-otp', orderId] as const,
  chat: (orderId: string) => [...deliveryKeys.all, 'chat', orderId] as const,
  publicShare: (token: string) => [...deliveryKeys.all, 'public-share', token] as const,
  cities: () => [...deliveryKeys.all, 'cities'] as const,
  zones: () => [...deliveryKeys.all, 'zones'] as const,
  zone: (zoneId: string) => [...deliveryKeys.all, 'zone', zoneId] as const,
  surge: (zoneId: string) => [...deliveryKeys.all, 'surge', zoneId] as const,
};

// ─── Public / cities ──────────────────────────────────────────────────────────

export function useCities() {
  return useQuery({
    queryKey: deliveryKeys.cities(),
    queryFn: () => deliveryApi.getCities(),
    staleTime: 5 * 60_000,
    retry: 2,
  });
}

export function useZones() {
  return useQuery({
    queryKey: deliveryKeys.zones(),
    queryFn: () => deliveryApi.getZones(),
    staleTime: 5 * 60_000,
  });
}

export function useZone(zoneId: string) {
  return useQuery({
    queryKey: deliveryKeys.zone(zoneId),
    queryFn: () => deliveryApi.getZone(zoneId),
    enabled: Boolean(zoneId),
    staleTime: 5 * 60_000,
  });
}

export function useSurgeStatus(zoneId: string) {
  return useQuery({
    queryKey: deliveryKeys.surge(zoneId),
    queryFn: () => deliveryApi.getSurgeStatus(zoneId),
    enabled: Boolean(zoneId),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ─── Order tracking ───────────────────────────────────────────────────────────

export function useOrderTracking(
  orderId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false | ((q: { state: { data?: { status?: string } | null } }) => number | false) }
) {
  return useQuery({
    queryKey: deliveryKeys.tracking(orderId),
    queryFn: () => deliveryApi.getTracking(orderId),
    enabled: Boolean(orderId) && (options?.enabled ?? true),
    staleTime: 3_000,
    refetchInterval: options?.refetchInterval ?? 8_000,
    // 404 = no rider trip yet, 403 = not your order: polling picks up assignment, retrying adds nothing.
    retry: (count, err) => {
      const status = errorStatus(err);
      if (status === 404 || status === 403) return false;
      return count < 1;
    },
  });
}

/** GET /tracking/order/:orderId/location — lightweight rider GPS poll (pairs with socket). */
export function useRiderLiveLocation(
  orderId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false | ((q: { state: { data?: unknown } }) => number | false);
  },
) {
  return useQuery({
    queryKey: deliveryKeys.riderLocation(orderId),
    queryFn: () => deliveryApi.getLiveLocation(orderId),
    enabled: Boolean(orderId) && (options?.enabled ?? true),
    staleTime: 0,
    refetchInterval: options?.refetchInterval ?? false,
    retry: false,
  });
}

export function useDropOtp(orderId: string, active = true) {
  return useQuery({
    queryKey: deliveryKeys.dropOtp(orderId),
    queryFn: () => deliveryApi.getDropOtp(orderId),
    enabled: Boolean(orderId) && active,
    // OTP is often unavailable until a rider is assigned; keep polling so a
    // cached null from early 404/409 does not stick through arrival.
    staleTime: 0,
    refetchInterval: (query) => {
      if (!active) return false;
      // Once we have digits, poll slower; otherwise keep trying every few seconds.
      return query.state.data?.otp ? 20_000 : 6_000;
    },
    retry: 1,
  });
}

export function useChatHistory(orderId: string, options?: { enabled?: boolean; refetchInterval?: number | false }) {
  return useQuery({
    queryKey: deliveryKeys.chat(orderId),
    queryFn: () => deliveryApi.getChatHistory(orderId),
    enabled: Boolean(orderId) && (options?.enabled ?? true),
    staleTime: 0,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

/** GET /tracking/share/:shareToken — guest family track (no login). */
export function usePublicShareTracking(
  shareToken: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false | ((q: { state: { data?: { status?: string } | null } }) => number | false);
  }
) {
  return useQuery({
    queryKey: deliveryKeys.publicShare(shareToken),
    queryFn: () => deliveryApi.getPublicShare(shareToken),
    enabled: Boolean(shareToken) && (options?.enabled ?? true),
    staleTime: 3_000,
    refetchInterval: options?.refetchInterval ?? 6_000,
    retry: (count, err) => {
      const status = (err as Error & { status?: number }).status;
      if (status === 404) return false;
      return count < 1;
    },
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSendChat(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => deliveryApi.sendChat(orderId, { text }),
    onSuccess: () => qc.invalidateQueries({ queryKey: deliveryKeys.chat(orderId) }),
  });
}

export function useCreateShareLink(orderId: string) {
  return useMutation({
    mutationFn: () => deliveryApi.createShareLink(orderId),
  });
}

export function useRevokeShareLink(orderId: string) {
  return useMutation({
    mutationFn: () => deliveryApi.revokeShareLink(orderId),
  });
}

export function useNudgePartner(orderId: string) {
  return useMutation({
    mutationFn: () => deliveryApi.nudgePartner(orderId),
  });
}

export function useContactSupport(orderId: string) {
  return useMutation({
    mutationFn: (input: { reason: TrackingSupportReason; message?: string }) =>
      deliveryApi.contactSupport(orderId, input),
  });
}

export function useSetDeliveryInstructions(orderId: string) {
  return useMutation({
    mutationFn: (payload: DeliveryInstructionsPayload) =>
      deliveryApi.setDeliveryInstructions(orderId, payload),
  });
}

export function useSetContactless(orderId: string) {
  return useMutation({
    mutationFn: (payload: ContactlessPayload) => deliveryApi.setContactless(orderId, payload),
  });
}

export function useChangeAddress(orderId: string) {
  return useMutation({
    mutationFn: (payload: AddressChangePayload) => deliveryApi.changeAddress(orderId, payload),
  });
}

export function useAddTip(orderId: string) {
  return useMutation({
    mutationFn: (payload: TrackingTipPayload) => deliveryApi.addTip(orderId, payload),
  });
}

export function useRatePartner(orderId: string) {
  return useMutation({
    mutationFn: (payload: RatePartnerPayload) => deliveryApi.ratePartner(orderId, payload),
  });
}
