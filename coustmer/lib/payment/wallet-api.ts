import { request } from '@/lib/payment/api';
import type {
  WalletFilter,
  WalletHistoryItem,
  WalletHistoryPage,
  WalletOverview,
  WalletTxCategory,
} from '@/lib/payment/wallet-types';

const WALLET_BASE = '/api/v1/payment-service/payments/wallet';

const CATEGORIES: WalletTxCategory[] = ['added', 'spent', 'refund', 'received', 'reversal', 'adjustment'];

const num = (v: unknown): number => (Number.isFinite(Number(v)) ? Number(v) : 0);
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v : null);

function mapOverview(d: Record<string, unknown>): WalletOverview {
  const awaiting = (d.awaitingCredit ?? {}) as Record<string, unknown>;
  const topUp = (d.topUp ?? {}) as Record<string, unknown>;
  return {
    balance: num(d.balance),
    currency: str(d.currency) ?? 'INR',
    isLocked: d.isLocked === true,
    lockReason: str(d.lockReason),
    totalAdded: num(d.totalAdded),
    totalSpent: num(d.totalSpent),
    totalReceived: num(d.totalReceived),
    totalRefunded: num(d.totalRefunded),
    transactionCount: num(d.transactionCount),
    lastActivityAt: str(d.lastActivityAt),
    awaitingCredit: { amount: num(awaiting.amount), count: num(awaiting.count) },
    topUp: {
      enabled: topUp.enabled === true,
      minAmount: num(topUp.minAmount),
      maxAmount: num(topUp.maxAmount),
      quickAmounts: Array.isArray(topUp.quickAmounts) ? topUp.quickAmounts.map(num).filter((n) => n > 0) : [],
    },
  };
}

function mapItem(d: Record<string, unknown>): WalletHistoryItem {
  const category = CATEGORIES.includes(d.category as WalletTxCategory)
    ? (d.category as WalletTxCategory)
    : d.type === 'debit'
      ? 'spent'
      : 'received';
  return {
    id: String(d.id ?? ''),
    transactionId: String(d.transactionId ?? ''),
    type: d.type === 'debit' ? 'debit' : 'credit',
    category,
    title: str(d.title) ?? (d.type === 'debit' ? 'Money spent' : 'Money received'),
    subtitle: str(d.subtitle),
    reason: str(d.reason),
    amount: num(d.amount),
    currency: str(d.currency) ?? 'INR',
    balanceAfter: num(d.balanceAfter),
    status: str(d.status) ?? 'completed',
    orderId: str(d.orderId),
    paymentMethod: str(d.paymentMethod),
    createdAt: String(d.createdAt ?? ''),
  };
}

export const walletApi = {
  /** GET /payments/wallet/summary — balance, lifetime totals, top-up limits (admin-managed). */
  getOverview: async (): Promise<WalletOverview> => {
    const res = await request<Record<string, unknown>>(`${WALLET_BASE}/summary`);
    return mapOverview((res.data ?? {}) as Record<string, unknown>);
  },

  /** GET /payments/wallet/transactions?filter=&page=&limit= */
  getHistory: async (filter: WalletFilter, page: number, limit = 20): Promise<WalletHistoryPage> => {
    const qs = new URLSearchParams({ filter, page: String(page), limit: String(limit) });
    const res = await request<Record<string, unknown>[]>(`${WALLET_BASE}/transactions?${qs.toString()}`);
    const envelope = res as unknown as Record<string, unknown>;
    const rows = Array.isArray(res.data) ? res.data : [];
    return {
      items: rows.map(mapItem),
      page: num(envelope.page) || page,
      totalPages: num(envelope.totalPages),
      total: num(envelope.total),
    };
  },

  /** GET /payments/wallet/transactions/:txId */
  getTransaction: async (txId: string): Promise<WalletHistoryItem> => {
    const res = await request<Record<string, unknown>>(`${WALLET_BASE}/transactions/${encodeURIComponent(txId)}`);
    return mapItem((res.data ?? {}) as Record<string, unknown>);
  },
};
