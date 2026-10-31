import { Alert } from 'react-native';

import { cartApi } from '@/lib/cart/api';
import { cartKeys } from '@/lib/cart/hooks';
import { sameModifiers } from '@/lib/cart/modifiers';
import { applyServerCartToStore } from '@/lib/cart/sync';
import type { Cart, CartModifier } from '@/lib/cart/types';
import { queryClient } from '@/lib/query-client';
import { useCartStore } from '@/store/cart-store';

export function findLine(lineOrMenuId: string, modifiers?: CartModifier[] | null) {
  const items = useCartStore.getState().items;
  const withMods = items.find(
    (i) =>
      (i.id === lineOrMenuId ||
        i.menuItemId === lineOrMenuId ||
        i.id.startsWith(`${lineOrMenuId}__`)) &&
      sameModifiers(i.modifiers, modifiers)
  );
  if (withMods || modifiers !== undefined) return withMods;
  return items.find(
    (i) => i.id === lineOrMenuId || i.menuItemId === lineOrMenuId
  );
}

export function notifyCartError(message: string) {
  Alert.alert('Cart update failed', message);
}

export function rememberCart(cart: Cart) {
  applyServerCartToStore(cart);
  queryClient.setQueryData(cartKeys.current(), cart);
}

export async function revertFailedAdd(lineId: string) {
  try {
    rememberCart(await cartApi.getCart());
  } catch {
    useCartStore.getState().removeItem(lineId);
  }
}

export async function syncCartItemQuantity(
  menuItemId: string,
  nextQty: number
): Promise<boolean> {
  const store = useCartStore.getState();
  const line = findLine(menuItemId);
  if (!line) return false;

  const previousQty = line.quantity;
  const lineId = line.id;
  const altId = line.menuItemId && line.menuItemId !== lineId ? line.menuItemId : null;
  const target = Math.max(0, Math.floor(nextQty));

  store.setQuantity(lineId, target);

  try {
    const tryIds = [lineId, altId, menuItemId].filter(Boolean) as string[];
    let synced = false;
    let lastError: unknown = null;

    for (const id of tryIds) {
      try {
        if (target <= 0) {
          rememberCart(await cartApi.removeItem(id));
        } else {
          rememberCart(await cartApi.updateItem(id, { quantity: target }));
        }
        synced = true;
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!synced) {
      await relinkOrReaddLine(line, menuItemId, altId, target, lastError);
    }
    return true;
  } catch (error) {
    store.setQuantity(lineId, previousQty);
    notifyCartError(
      error instanceof Error ? error.message : 'Could not update quantity'
    );
    return false;
  }
}

async function relinkOrReaddLine(
  line: NonNullable<ReturnType<typeof findLine>>,
  menuItemId: string,
  altId: string | null,
  target: number,
  lastError: unknown
) {
  const latest = await cartApi.getCart();
  rememberCart(latest);
  const lineId = line.id;
  if (target <= 0) {
    const stillExists = latest.items.some(
      (item) =>
        item.id === lineId ||
        item.id === menuItemId ||
        item.menuItemId === menuItemId ||
        (altId ? item.id === altId || item.menuItemId === altId : false) ||
        (item.name === line.name &&
          item.price === line.price &&
          sameModifiers(item.modifiers, line.modifiers))
    );
    if (!stillExists) return;
  }
  const resolved = latest.items.find(
    (item) =>
      item.id === lineId ||
      (item.menuItemId === (line.menuItemId || menuItemId) &&
        sameModifiers(item.modifiers, line.modifiers)) ||
      (item.name === line.name &&
        item.price === line.price &&
        sameModifiers(item.modifiers, line.modifiers))
  );
  if (resolved) {
    if (target <= 0) {
      rememberCart(await cartApi.removeItem(resolved.id));
    } else {
      rememberCart(await cartApi.updateItem(resolved.id, { quantity: target }));
    }
    return;
  }
  if (!lastError) return;
  const restaurant = useCartStore.getState().restaurant;
  const msg = lastError instanceof Error ? lastError.message : '';
  const missing = /not found|ITEM_NOT_FOUND/i.test(msg);
  if (missing && restaurant?.id && (line.menuItemId || menuItemId) && target > 0) {
    rememberCart(
      await cartApi.addItem({
        menuItemId: line.menuItemId || menuItemId,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name || 'Restaurant',
        name: line.name,
        price: line.basePrice ?? line.price,
        quantity: target,
        isVeg: line.isVeg,
        imageUrl: line.imageUrl,
        specialInstructions: line.specialInstructions,
        modifiers: line.modifiers,
      })
    );
    return;
  }
  throw lastError;
}

export async function incrementCartItem(menuItemId: string): Promise<boolean> {
  const line = findLine(menuItemId);
  if (!line) return false;
  return syncCartItemQuantity(line.id, line.quantity + 1);
}

export async function decrementCartItem(menuItemId: string): Promise<boolean> {
  const line = findLine(menuItemId);
  if (!line) return false;
  return syncCartItemQuantity(line.id, line.quantity - 1);
}
