/** Merge the guest cart into the signed-in cart (best-effort; keeps the local cart on failure). */
export async function mergeGuestCartOnLogin(): Promise<void> {
  try {
    const { cartApi } = await import('@/lib/cart/api');
    const { applyServerCartToStore } = await import('@/lib/cart/sync');
    const { clearCartSessionId } = await import('@/lib/cart/session');
    try {
      const merged = await cartApi.merge();
      applyServerCartToStore(merged);
      // Drop guest session so a future anonymous cart starts clean
      await clearCartSessionId();
    } catch {
      const cart = await cartApi.getCart();
      applyServerCartToStore(cart);
      await clearCartSessionId();
    }
  } catch {
    // keep local cart
  }
}

export async function clearCartOnLogout(): Promise<void> {
  try {
    const { clearCartSessionId } = await import('@/lib/cart/session');
    const { useCartStore } = await import('@/store/cart-store');
    await clearCartSessionId();
    useCartStore.getState().clearCart();
  } catch {
    // ignore cart cleanup failures
  }
}
