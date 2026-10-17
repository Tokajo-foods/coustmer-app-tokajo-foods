import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { paymentKeys } from '@/lib/payment/hooks';
import { walletApi } from '@/lib/payment/wallet-api';
import type { WalletFilter } from '@/lib/payment/wallet-types';

/** Nested under paymentKeys.wallet() so top-up / order invalidation refreshes everything. */
export const walletKeys = {
  overview: () => [...paymentKeys.wallet(), 'overview'] as const,
  history: (filter: WalletFilter) => [...paymentKeys.wallet(), 'history', filter] as const,
  tx: (txId: string) => [...paymentKeys.wallet(), 'tx', txId] as const,
};

const PAGE_SIZE = 20;

/** Polls while a paid top-up is still being credited so the balance updates on its own. */
export function useWalletOverview() {
  return useQuery({
    queryKey: walletKeys.overview(),
    queryFn: walletApi.getOverview,
    refetchInterval: (query) => ((query.state.data?.awaitingCredit.count ?? 0) > 0 ? 10_000 : false),
  });
}

export function useWalletHistory(filter: WalletFilter) {
  return useInfiniteQuery({
    queryKey: walletKeys.history(filter),
    queryFn: ({ pageParam }) => walletApi.getHistory(filter, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
}

export function useWalletTransaction(txId: string | null) {
  return useQuery({
    queryKey: walletKeys.tx(txId ?? ''),
    queryFn: () => walletApi.getTransaction(txId ?? ''),
    enabled: Boolean(txId),
  });
}
