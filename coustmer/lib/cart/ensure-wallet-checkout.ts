import { cartApi } from '@/lib/cart/api';
import type { Cart } from '@/lib/cart/types';
import { formatInr } from '@/lib/format/money';

/**
 * Full-bill Tokajo wallet only — applies server cover until grandTotal is ₹0.
 * Partial wallet is not used for `paymentMethod: wallet`.
 */
export async function ensureWalletCoversCheckout(input: {
  payableBeforeWallet: number;
  walletBalance: number;
}): Promise<Cart> {
  const need = Math.round(Math.max(0, input.payableBeforeWallet) * 100) / 100;

  if (need > 0.009 && input.walletBalance + 0.009 < need) {
    const short = Math.ceil((need - input.walletBalance) * 100) / 100;
    throw new Error(
      `Wallet does not cover the full bill. Add ${formatInr(short)} or choose another payment method.`
    );
  }

  // Let cart compute the live bill (central fees) and cover 100% — avoids ₹ leftover.
  const cart = await cartApi.applyWallet();
  const remaining = Number(cart.total ?? 0);
  if (remaining > 0.009) {
    throw new Error(
      'Wallet does not cover the full bill. Top up your wallet or pay with UPI/card.'
    );
  }
  return cart;
}

/** Server `totalBeforeWallet` (whole rupees); older payloads fall back to grandTotal + wallet. */
export function payableBeforeWallet(bill: {
  grandTotal?: number;
  walletApplied?: number;
  totalBeforeWallet?: number | null;
}): number {
  if (bill.totalBeforeWallet != null && Number.isFinite(bill.totalBeforeWallet)) {
    return Math.max(0, bill.totalBeforeWallet);
  }
  return (
    Math.round(
      (Math.max(0, Number(bill.grandTotal) || 0) +
        Math.max(0, Number(bill.walletApplied) || 0)) *
        100,
    ) / 100
  );
}
