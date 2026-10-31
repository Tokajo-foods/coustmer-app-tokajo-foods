import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { paymentApi } from '@/lib/payment/api';
import type {
  InitiatePaymentPayload,
  RequestRefundPayload,
  SavePaymentMethodPayload,
  VerifyPaymentPayload,
} from '@/lib/payment/types';
import {
  walletTopupApi,
  type WalletTopupMethod,
  type WalletTopupVerifyPayload,
} from '@/lib/payment/wallet-topup-api';
import {
  subscriptionPaymentApi,
  type SubscriptionPayMethod,
  type SubscriptionVerifyPayload,
} from '@/lib/payment/subscription-api';

export const paymentKeys = {
  all: ['payment'] as const,
  history: (params?: { page?: number; limit?: number }) =>
    [...paymentKeys.all, 'history', params ?? {}] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  methods: () => [...paymentKeys.all, 'methods'] as const,
  wallet: () => [...paymentKeys.all, 'wallet'] as const,
  refund: (id: string) => [...paymentKeys.all, 'refund', id] as const,
  orderRefunds: (orderId: string) =>
    [...paymentKeys.all, 'order-refunds', orderId] as const,
};

function invalidatePaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  extras?: { paymentId?: string; orderId?: string; refundId?: string }
) {
  queryClient.invalidateQueries({ queryKey: paymentKeys.all });
  if (extras?.paymentId) {
    queryClient.invalidateQueries({
      queryKey: paymentKeys.detail(extras.paymentId),
    });
  }
  if (extras?.orderId) {
    queryClient.invalidateQueries({
      queryKey: paymentKeys.orderRefunds(extras.orderId),
    });
  }
  if (extras?.refundId) {
    queryClient.invalidateQueries({
      queryKey: paymentKeys.refund(extras.refundId),
    });
  }
}

/** GET /payments/history */
export function usePaymentHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: paymentKeys.history(params),
    queryFn: () => paymentApi.getHistory(params),
  });
}

/** GET /payments/:paymentId */
export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => paymentApi.getPayment(paymentId),
    enabled: Boolean(paymentId),
  });
}

/** GET /payments/methods */
export function usePaymentMethods(enabled = true) {
  return useQuery({
    queryKey: paymentKeys.methods(),
    queryFn: paymentApi.getMethods,
    enabled,
  });
}

/** GET /payments/wallet */
export function usePaymentWallet(enabled = true) {
  return useQuery({
    queryKey: paymentKeys.wallet(),
    queryFn: paymentApi.getWallet,
    enabled,
  });
}

/** GET /payments/refunds/:refundId */
export function useRefund(refundId: string) {
  return useQuery({
    queryKey: paymentKeys.refund(refundId),
    queryFn: () => paymentApi.getRefund(refundId),
    enabled: Boolean(refundId),
  });
}

/** GET /payments/:orderId/refunds */
export function useOrderRefunds(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.orderRefunds(orderId),
    queryFn: () => paymentApi.getOrderRefunds(orderId),
    enabled: Boolean(orderId),
  });
}

/** POST /payments/initiate */
export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) =>
      paymentApi.initiate(payload),
    onSuccess: (payment) => {
      invalidatePaymentQueries(queryClient, {
        paymentId: payment.id,
        orderId: payment.orderId,
      });
    },
  });
}

/** POST /payments/verify */
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) => paymentApi.verify(payload),
    onSuccess: (payment) => {
      invalidatePaymentQueries(queryClient, {
        paymentId: payment.id,
        orderId: payment.orderId,
      });
      queryClient.invalidateQueries({ queryKey: paymentKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

/** POST /payments/methods */
export function useSavePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SavePaymentMethodPayload) =>
      paymentApi.saveMethod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.methods() });
    },
  });
}

/** DELETE /payments/methods/:methodId */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (methodId: string) => paymentApi.deleteMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.methods() });
    },
  });
}

/** PUT /payments/methods/:methodId/default */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (methodId: string) => paymentApi.setDefaultMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.methods() });
    },
  });
}

/** POST /payments/subscriptions/subscribe — returns a Razorpay session for Super. */
export function useStartSubscriptionPayment() {
  return useMutation({
    mutationFn: (payload: { planId: string; method: SubscriptionPayMethod }) =>
      subscriptionPaymentApi.start(payload),
  });
}

/** POST /payments/subscriptions/verify — activates Super, then refreshes membership + bill. */
export function useVerifySubscriptionPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubscriptionVerifyPayload) => subscriptionPaymentApi.verify(payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'mySubscription'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/** POST /payments/wallet/topup — returns a Razorpay session to open checkout. */
export function useStartWalletTopup() {
  return useMutation({
    mutationFn: (payload: { amount: number; method: WalletTopupMethod }) =>
      walletTopupApi.start(payload),
  });
}

/** POST /payments/wallet/topup/verify — credits the wallet after checkout success. */
export function useVerifyWalletTopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletTopupVerifyPayload) => walletTopupApi.verify(payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.wallet() });
    },
  });
}

/** POST /payments/refunds/request */
export function useRequestRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestRefundPayload) =>
      paymentApi.requestRefund(payload),
    onSuccess: (refund) => {
      invalidatePaymentQueries(queryClient, {
        orderId: refund.orderId,
        refundId: refund.id,
        paymentId: refund.paymentId,
      });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}
