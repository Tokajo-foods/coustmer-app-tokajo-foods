import { useEffect } from 'react';

import { syncCheckoutWallet } from '@/lib/cart/ensure-wallet-checkout';
import { useCartStore } from '@/store/cart-store';

import { canonicalPayChoice } from './payment-display';

/** A scheduled order is paid online or from the wallet. Cash is switched to pay online. */
export function usePrepaidSchedule(): void {
  const scheduledFor = useCartStore((s) => s.scheduledFor);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);

  useEffect(() => {
    if (!scheduledFor || canonicalPayChoice(paymentMethod) !== 'cod') return;
    setPaymentMethod('online');
    void syncCheckoutWallet('online').catch(() => undefined);
  }, [scheduledFor, paymentMethod, setPaymentMethod]);
}
