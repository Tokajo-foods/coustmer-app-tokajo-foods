import { useMemo, useRef } from 'react';

import { mapBillBreakdown, type BillBreakdown } from '@/lib/cart/bill';
import type { Cart } from '@/lib/cart/types';

type Input = {
  /** GET /cart/bill (validated, authoritative). */
  liveBill: BillBreakdown | undefined;
  /** GET /cart — server amounts used only until the bill loads. */
  serverCart: Cart | undefined;
  deliveryType: 'delivery' | 'takeaway';
  /** Chosen tip. Applied on the bill immediately, before PUT /cart/tip returns. */
  tip: number;
  paymentMethod: string;
};

function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Shows the tap immediately. The server cart replaces these numbers when the PUT returns. */
function applyChoices(
  bill: BillBreakdown,
  deliveryType: 'delivery' | 'takeaway',
  tip: number,
  quotedFee: number,
  quotedRain: number,
): BillBreakdown {
  const freeDelivery = bill.superFreeDelivery || bill.autoFreeDelivery;
  const takeaway = deliveryType === 'takeaway';
  const nextTip = takeaway ? 0 : tip;
  const nextFee = takeaway || freeDelivery
    ? 0
    : bill.deliveryFee > 0
      ? bill.deliveryFee
      : quotedFee;
  const nextRain = takeaway ? 0 : bill.rainFee > 0 ? bill.rainFee : quotedRain;
  const delta = money(
    (nextFee - bill.deliveryFee) + (nextRain - bill.rainFee) + (nextTip - bill.tipAmount),
  );
  if (
    delta === 0 &&
    bill.deliveryType === deliveryType &&
    bill.tipAmount === nextTip &&
    bill.deliveryFee === nextFee
  ) {
    return bill;
  }
  const totalBeforeWallet = bill.totalBeforeWallet == null
    ? null
    : Math.max(0, money(bill.totalBeforeWallet + delta));
  return {
    ...bill,
    deliveryType,
    deliveryFee: nextFee,
    rainFee: nextRain,
    tipAmount: nextTip,
    totalBeforeWallet,
    grandTotal: Math.max(0, money(bill.grandTotal + delta)),
    walletShortfall: bill.walletShortfall == null
      ? null
      : Math.max(0, money(bill.walletShortfall + delta)),
    billReady: bill.billReady || nextFee > 0 || takeaway,
  };
}

/**
 * Checkout bill. Server amounts are shown as returned. Tip, takeaway, and
 * delivery are applied on top in the same frame as the tap, then replaced
 * by the PUT response.
 */
export function useCheckoutTotals({
  liveBill,
  serverCart,
  deliveryType,
  tip,
  paymentMethod,
}: Input) {
  const quotedFee = useRef(0);
  const quotedRain = useRef(0);
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
    const priced =
      deliveryType === 'takeaway' ||
      (saved?.deliveryFee ?? 0) > 0 ||
      saved?.superFreeDelivery === true ||
      saved?.autoFreeDelivery === true ||
      typeof saved?.deliveryFeeBase === 'number';
    return mapBillBreakdown({
      itemsSubtotal: saved?.subtotal ?? 0,
      deliveryFee: saved?.deliveryFee ?? 0,
      ...(typeof saved?.deliveryFeeBase === 'number'
        ? { deliveryFeeBase: saved.deliveryFeeBase }
        : {}),
      ...(priced ? { billReady: true } : {}),
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

  if (!bill.superFreeDelivery && !bill.autoFreeDelivery && bill.deliveryFee > 0) {
    quotedFee.current = bill.deliveryFee;
    quotedRain.current = bill.rainFee;
  }
  const shown = applyChoices(bill, deliveryType, tip, quotedFee.current, quotedRain.current);

  const totalBeforeWallet = shown.totalBeforeWallet ?? shown.grandTotal;
  /** Server says the wallet can pay the whole bill (`walletShortfall === 0`). */
  const walletCoversBill = paymentMethod === 'wallet' && shown.walletShortfall === 0;

  /** What the customer pays now via the selected method. */
  const payable = walletCoversBill ? 0 : shown.grandTotal;

  return { bill: shown, payable, totalBeforeWallet };
}
