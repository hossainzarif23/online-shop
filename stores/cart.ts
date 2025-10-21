import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { CartItem } from "@/types";

// Cart state
export const cartItemsAtom = atomWithStorage<CartItem[]>("cart-items", []);

// Derived atoms
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
});

export const cartCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((count, item) => count + item.quantity, 0);
});

// Cart actions
export const addToCartAtom = atom(null, (get, set, newItem: CartItem) => {
  const items = get(cartItemsAtom);
  const existingItem = items.find(
    (item) => item.productId === newItem.productId
  );

  if (existingItem) {
    set(
      cartItemsAtom,
      items.map((item) =>
        item.productId === newItem.productId
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      )
    );
  } else {
    set(cartItemsAtom, [...items, newItem]);
  }
});

export const removeFromCartAtom = atom(null, (get, set, productId: string) => {
  const items = get(cartItemsAtom);
  set(
    cartItemsAtom,
    items.filter((item) => item.productId !== productId)
  );
});

export const updateCartItemQuantityAtom = atom(
  null,
  (
    get,
    set,
    { productId, quantity }: { productId: string; quantity: number }
  ) => {
    const items = get(cartItemsAtom);
    if (quantity <= 0) {
      set(
        cartItemsAtom,
        items.filter((item) => item.productId !== productId)
      );
    } else {
      set(
        cartItemsAtom,
        items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  }
);

export const clearCartAtom = atom(null, (get, set) => {
  set(cartItemsAtom, []);
});
