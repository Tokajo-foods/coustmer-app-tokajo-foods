export type WalletFilter = 'all' | 'added' | 'spent' | 'received' | 'refund';

export type WalletTxCategory =
  | 'added'
  | 'spent'
  | 'refund'
  | 'received'
  | 'reversal'
  | 'adjustment';

/** GET /payments/wallet/summary */
export type WalletOverview = {
  balance: number;
  currency: string;
  isLocked: boolean;
  lockReason: string | null;
  totalAdded: number;
  totalSpent: number;
  totalReceived: number;
  totalRefunded: number;
  transactionCount: number;
  lastActivityAt: string | null;
  awaitingCredit: { amount: number; count: number };
  topUp: {
    enabled: boolean;
    minAmount: number;
    maxAmount: number;
    quickAmounts: number[];
  };
};

/** One row of GET /payments/wallet/transactions */
export type WalletHistoryItem = {
  id: string;
  transactionId: string;
  type: 'credit' | 'debit';
  category: WalletTxCategory;
  title: string;
  subtitle: string | null;
  reason: string | null;
  amount: number;
  currency: string;
  balanceAfter: number;
  status: string;
  orderId: string | null;
  paymentMethod: string | null;
  createdAt: string;
};

export type WalletHistoryPage = {
  items: WalletHistoryItem[];
  page: number;
  totalPages: number;
  total: number;
};
