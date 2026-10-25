import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { notificationApi } from '@/lib/notification/api';
import { notificationKeys } from '@/lib/notification/hooks';
import type { AppNotification } from '@/lib/notification/types';

export const INBOX_PAGE_SIZE = 30;

/**
 * Loads inbox pages 1..pageCount under the shared list keys, so the optimistic
 * read / delete patches in hooks.ts update every loaded page.
 */
export function useInboxPages(
  pageCount: number,
  opts: { unread?: boolean; enabled: boolean; refetchInterval?: number }
) {
  const results = useQueries({
    queries: Array.from({ length: pageCount }, (_, i) => {
      const params = { page: i + 1, limit: INBOX_PAGE_SIZE, unread: opts.unread };
      return {
        queryKey: notificationKeys.list(params),
        queryFn: () => notificationApi.getNotifications(params),
        enabled: opts.enabled,
        staleTime: 15_000,
        refetchInterval: i === 0 ? (opts.refetchInterval ?? false) : false,
        retry: 1,
      };
    }),
  });

  const first = results[0];
  const last = results[results.length - 1];

  const notifications = useMemo(() => {
    const seen = new Set<string>();
    const rows: AppNotification[] = [];
    for (const r of results) {
      for (const n of r.data?.notifications ?? []) {
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        rows.push(n);
      }
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.map((r) => r.dataUpdatedAt).join(',')]);

  const totalPages = last?.data?.meta?.totalPages;
  const lastCount = last?.data?.notifications.length ?? 0;
  const hasMore =
    typeof totalPages === 'number' ? pageCount < totalPages : lastCount >= INBOX_PAGE_SIZE;

  return {
    notifications,
    isLoading: Boolean(first?.isLoading),
    isError: Boolean(first?.isError) && !first?.data,
    error: first?.error,
    isFetchingMore: Boolean(last?.isFetching) && results.length > 1,
    hasMore: Boolean(last?.data) && hasMore,
    refetch: () => Promise.all(results.map((r) => r.refetch())),
  };
}
