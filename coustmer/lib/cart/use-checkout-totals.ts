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
    const saved = serverCart as
      | (Cart & {
          deliveryFeeBase?: number;
          deliveryDistanceKm?: number;
          superFreeDelivery?: boolean;
          autoFreeDelivery?: boolean;
          autoFreeDeliveryMinOrder?: number;
          autoFreeDeliveryTitle?: string;
        })
      | undefined;
    return mapBillBreakdown({
      itemsSubtotal: saved?.subtotal ?? 0,
      deliveryFee: saved?.deliveryFee ?? 0,
      ...(typeof saved?.deliveryFeeBase === 'number' && saved.deliveryFeeBase > 0
        ? { deliveryFeeBase: saved.deliveryFeeBase }
        : {}),
      ...(typeof saved?.deliveryDistanceKm === 'number'
        ? { deliveryDistanceKm: saved.deliveryDistanceKm }
        : {}),
      deliveryType,
      taxAmount: saved?.tax ?? 0,
      packagingCharge: saved?.packagingCharge ?? 0,
      platformFee: saved?.platformFee ?? 0,
      taxesAndCharges: saved?.taxesAndCharges ?? 0,
      rainFee: saved?.rainFee ?? 0,
      tipAmount: saved?.tip ?? 0,
      discount: saved?.discount ?? 0,
      walletApplied: saved?.walletApplied ?? 0,
      roundOff: saved?.roundOff ?? 0,
      totalBeforeWallet: saved?.totalBeforeWallet ?? undefined,
      grandTotal: saved?.total ?? 0,
      superFreeDelivery: saved?.superFreeDelivery,
      autoFreeDelivery: saved?.autoFreeDelivery,
      autoFreeDeliveryMinOrder: saved?.autoFreeDeliveryMinOrder,
      autoFreeDeliveryTitle: saved?.autoFreeDeliveryTitle,
    });
  }, [liveBill, serverCart, deliveryType]);

  const totalBeforeWallet = bill.totalBeforeWallet ?? bill.grandTotal;
  /** Server says the wallet can pay the whole bill (`walletShortfall === 0`). */
  const walletCoversBill = paymentMethod === 'wallet' && bill.walletShortfall === 0;

  /** What the customer pays now via the selected method. */
  const payable = walletCoversBill ? 0 : bill.grandTotal;

  return { bill, payable, totalBeforeWallet };
}
