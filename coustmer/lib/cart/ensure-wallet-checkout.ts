import { cartApi } from '@/lib/cart/api';
import { cartKeys } from '@/lib/cart/hooks';
import { applyServerCartToStore } from '@/lib/cart/sync';
import type { Cart } from '@/lib/cart/types';
import { formatInr } from '@/lib/format/money';
import { queryClient } from '@/lib/query-client';

/**
 * Full-bill Tokajo wallet only — cart-service applies the wallet and reprices.
 * Any amount left on the server bill is the shortfall; nothing is computed here.
 */
export async function ensureWalletCoversCheckout(): Promise<Cart> {
  const cart = await cartApi.applyWallet();
  applyServerCartToStore(cart);
  queryClient.setQueryData(cartKeys.current(), cart);
  const remaining = Number(cart.total ?? 0);
  if (remaining > 0) {
    throw new Error(
      `Wallet does not cover the full bill. Add ${formatInr(remaining)} or choose another payment method.`
    );
  }
  return cart;
}
