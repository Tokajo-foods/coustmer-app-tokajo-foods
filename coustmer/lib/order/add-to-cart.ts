import { cartApi } from '@/lib/cart/api';
import { cartLineLocalId } from '@/lib/cart/modifiers';
import type { CartModifier } from '@/lib/cart/types';
import { payPriceOf } from '@/lib/restaurant/item-price';
import type { MenuItem } from '@/lib/restaurant/types';
import type { CartItem } from '@/store/cart-store';
import { useCartStore } from '@/store/cart-store';

import {
  findLine,
  incrementCartItem,
  notifyCartError,
  rememberCart,
  revertFailedAdd,
} from '@/lib/order/cart-qty-sync';

export {
  decrementCartItem,
  incrementCartItem,
  syncCartItemQuantity,
} from '@/lib/order/cart-qty-sync';

type RestaurantRef = {
  id: string;
  name: string;
  imageUrl?: string;
};

export type AddMenuItemOptions = {
  onAdded?: () => void;
  modifiers?: CartModifier[];
  basePrice?: number;
};

async function postLine(input: {
  menuItemId: string;
  restaurant: RestaurantRef;
  name: string;
  price: number;
  quantity: number;
  isVeg?: boolean;
  imageUrl?: string;
  specialInstructions?: string;
  modifiers?: CartModifier[];
  lineId: string;
}) {
  try {
    const cart = await cartApi.addItem({
      menuItemId: input.menuItemId,
      restaurantId: input.restaurant.id,
      restaurantName: input.restaurant.name || 'Restaurant',
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      isVeg: input.isVeg,
      imageUrl: input.imageUrl,
      specialInstructions: input.specialInstructions,
      modifiers: input.modifiers,
    });
    rememberCart(cart);
  } catch (error) {
    await revertFailedAdd(input.lineId);
    notifyCartError(
      error instanceof Error ? error.message : 'Could not add that item. Try again.'
    );
  }
}

async function addRemote(
  item: Omit<CartItem, 'quantity'> & { quantity?: number },
  restaurant: RestaurantRef,
  options?: { onAdded?: () => void }
) {
  const store = useCartStore.getState();
  const modifiers = item.modifiers?.length ? item.modifiers : undefined;
  const menuItemId = item.menuItemId || item.id;
  const basePrice =
    typeof item.basePrice === 'number' ? item.basePrice : item.price;
  const lineId = cartLineLocalId(menuItemId, modifiers);

  const local = store.addItem(
    {
      id: lineId,
      menuItemId,
      name: item.name,
      price: basePrice,
      basePrice,
      isVeg: item.isVeg,
      imageUrl: item.imageUrl,
      specialInstructions:
        typeof item.specialInstructions === 'string'
          ? item.specialInstructions
          : undefined,
      modifiers,
      quantity: item.quantity ?? 1,
    },
    restaurant
  );

  if (!local.ok) return local;
  options?.onAdded?.();
  await postLine({
    menuItemId,
    restaurant,
    name: item.name,
    price: basePrice,
    quantity: item.quantity ?? 1,
    isVeg: item.isVeg,
    imageUrl: item.imageUrl,
    specialInstructions:
      typeof item.specialInstructions === 'string'
        ? item.specialInstructions
        : undefined,
    modifiers,
    lineId,
  });
  return { ok: true as const };
}

export function addMenuItemToCart(
  item: MenuItem,
  restaurant: RestaurantRef,
  options?: AddMenuItemOptions
) {
  const store = useCartStore.getState();
  const modifiers = options?.modifiers?.length ? options.modifiers : undefined;
  const menuItemId = item.id;
  const basePrice =
    typeof options?.basePrice === 'number' ? options.basePrice : payPriceOf(item);
  const lineId = cartLineLocalId(menuItemId, modifiers);
  const existing = findLine(menuItemId, modifiers ?? []);

  if (existing) {
    options?.onAdded?.();
    void incrementCartItem(existing.id);
    return true;
  }

  const modifierAdd = (modifiers ?? []).reduce((sum, m) => sum + (Number(m.price) || 0), 0);
  const listUnit = item.price + modifierAdd;
  const cartLine = {
    id: lineId,
    menuItemId,
    name: item.name,
    price: basePrice,
    listPrice: listUnit > basePrice ? listUnit : undefined,
    basePrice,
    isVeg: item.isVeg,
    imageUrl: item.imageUrl,
    specialInstructions:
      typeof item.specialInstructions === 'string'
        ? item.specialInstructions
        : undefined,
    modifiers,
  };

  const result = store.addItem(cartLine, restaurant);
  if (result.ok) {
    options?.onAdded?.();
    void postLine({
      menuItemId,
      restaurant,
      name: item.name,
      price: basePrice,
      quantity: 1,
      isVeg: item.isVeg,
      imageUrl: item.imageUrl,
      specialInstructions: cartLine.specialInstructions,
      modifiers,
      lineId,
    });
    return true;
  }

  store.promptReplaceCart({ item: cartLine, restaurant, options });
  return false;
}

export async function executeReplaceCart(
  item: Omit<CartItem, 'quantity'> & { quantity?: number },
  restaurant: RestaurantRef,
  options?: { onAdded?: () => void }
) {
  const store = useCartStore.getState();
  try {
    await cartApi.clearCart();
  } catch (error) {
    notifyCartError(
      error instanceof Error
        ? error.message
        : 'Could not clear previous cart on server'
    );
  }
  store.clearCart();
  await addRemote(item, restaurant, options);
}
