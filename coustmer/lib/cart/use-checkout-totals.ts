import { useMemo } from 'react';

import { mapBillBreakdown, type BillBreakdown } from '@/lib/cart/bill';
import type { Cart } from '@/lib/cart/types';

type Input = {
  /** GET /cart/bill (validated, authoritative). */
  liveBill: BillBreakdown | undefined;
  /** GET /cart — server amounts used only until the bill loads. */
  serverCart: Cart | undefined;
  deliveryType: 'delivery' | 'takeaway';
  paymentMethod: string;
};

/**
 * Single checkout view of the bill. Every amount is a cart-service value
 * (already rounded server-side); nothing is summed or rounded here.
 */
export function useCheckoutTotals({
  liveBill,
  serverCart,
  deliveryType,
  paymentMethod,
}: Input) {
  const bill = useMemo<BillBreakdown>(() => {
    if (liveBill) return liveBill;
    return mapBillBreakdown({
      itemsSubtotal: serverCart?.subtotal ?? 0,
      deliveryFee: serverCart?.deliveryFee ?? 0,
      deliveryType,
      taxAmount: serverCart?.tax ?? 0,
      packagingCharge: serverCart?.packagingCharge ?? 0,
      platformFee: serverCart?.platformFee ?? 0,
      taxesAndCharges: serverCart?.taxesAndCharges ?? 0,
      rainFee: serverCart?.rainFee ?? 0,
      tipAmount: serverCart?.tip ?? 0,
      discount: serverCart?.discount ?? 0,
      walletApplied: serverCart?.walletApplied ?? 0,
      roundOff: serverCart?.roundOff ?? 0,
      totalBeforeWallet: serverCart?.totalBeforeWallet ?? undefined,
      grandTotal: serverCart?.total ?? 0,
      superFreeDelivery: (serverCart as { superFreeDelivery?: boolean } | undefined)
        ?.superFreeDelivery,
    });
  }, [liveBill, serverCart, deliveryType]);

  const totalBeforeWallet = bill.totalBeforeWallet ?? bill.grandTotal;
  /** Server says the wallet can pay the whole bill (`walletShortfall === 0`). */
  const walletCoversBill = paymentMethod === 'wallet' && bill.walletShortfall === 0;

  /** What the customer pays now via the selected method. */
  const payable = walletCoversBill ? 0 : bill.grandTotal;

  return { bill, payable, totalBeforeWallet };
}
