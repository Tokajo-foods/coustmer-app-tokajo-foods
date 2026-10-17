import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/payment/api';

/** Admin-managed tip presets + wallet top-up limits (`GET /payments/config/money`). */
export type AppMoneyConfig = {
  tipPresetsInr: number[];
  maxTipInr: number;
  walletMinTopUpInr: number;
  walletMaxTopUpInr: number;
  walletQuickAmountsInr: number[];
  version: number;
};

export const moneyConfigKeys = {
  all: ['pricing', 'money-config'] as const,
};

const numbers = (v: unknown): number[] =>
  Array.isArray(v) ? v.map(Number).filter((n) => Number.isFinite(n) && n >= 0) : [];

export async function fetchAppMoneyConfig(): Promise<AppMoneyConfig> {
  const res = await request<Record<string, unknown>>('/api/v1/payment-service/payments/config/money');
  const d = (res.data ?? {}) as Record<string, unknown>;
  return {
    tipPresetsInr: numbers(d.tipPresetsInr),
    maxTipInr: Number(d.maxTipInr) || 0,
    walletMinTopUpInr: Number(d.walletMinTopUpInr) || 0,
    walletMaxTopUpInr: Number(d.walletMaxTopUpInr) || 0,
    walletQuickAmountsInr: numbers(d.walletQuickAmountsInr),
    version: Number(d.version) || 0,
  };
}

export function useAppMoneyConfig() {
  return useQuery({
    queryKey: moneyConfigKeys.all,
    queryFn: fetchAppMoneyConfig,
    staleTime: 5 * 60_000,
    refetchOnReconnect: true,
  });
}
