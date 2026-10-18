import { useEffect, useRef } from 'react';

import { PaymentApiError } from '@/lib/payment/api';

const NOTHING_CHARGED = 'Nothing was charged.';

/** Customer-facing copy for a failed "start top-up" call. Nothing is charged before Razorpay opens. */
export function topupStartErrorMessage(error: unknown): string {
  if (error instanceof PaymentApiError) {
    if (error.status === 0) {
      return `Can't reach Tokajo right now. Check your internet and try again. ${NOTHING_CHARGED}`;
    }
    if (error.code === 'CSRF') return error.message;
    if (error.status >= 500 || error.code === 'GATEWAY_UNAVAILABLE') {
      return `Payments are temporarily unavailable. ${NOTHING_CHARGED} Please try again in a few minutes.`;
    }
    if (error.status === 429) return 'Too many attempts. Please wait a minute and try again.';
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return `Could not start the payment. ${NOTHING_CHARGED} Please try again.`;
}

/** Network drop or 5xx: the verify may not have reached the server, and verify is idempotent. */
function isRetryable(error: unknown): boolean {
  return error instanceof PaymentApiError && (error.status === 0 || error.status >= 500);
}

const RETRY_DELAYS_MS = [1500, 3000];

export async function withVerifyRetry<T>(run: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay == null || !isRetryable(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

const POLL_EVERY_MS = 5000;
const POLL_FOR_MS = 5 * 60 * 1000;

/**
 * While a paid top-up is still being confirmed (verify failed; webhook / reconciler will credit),
 * poll the balance and report when the expected credit lands.
 */
export function useAwaitTopupCredit(options: {
  active: boolean;
  baseline: number | null;
  amount: number;
  balance: number | null;
  refetch: () => unknown;
  onCredited: () => void;
}) {
  const { active, baseline, amount, balance, refetch, onCredited } = options;
  const creditedRef = useRef(onCredited);
  creditedRef.current = onCredited;

  useEffect(() => {
    if (!active) return;
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > POLL_FOR_MS) {
        clearInterval(timer);
        return;
      }
      void refetch();
    }, POLL_EVERY_MS);
    return () => clearInterval(timer);
  }, [active, refetch]);

  useEffect(() => {
    if (!active || baseline == null || balance == null) return;
    if (balance >= baseline + amount - 0.01) creditedRef.current();
  }, [active, baseline, amount, balance]);
}
