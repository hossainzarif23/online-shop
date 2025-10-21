import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const wishlistAtom = atomWithStorage<string[]>("wishlist", []);

export const isInWishlistAtom = atom((get) => (productId: string) => {
  const wishlist = get(wishlistAtom);
  return wishlist.includes(productId);
});

export const toggleWishlistAtom = atom(null, (get, set, productId: string) => {
  const wishlist = get(wishlistAtom);
  if (wishlist.includes(productId)) {
    set(
      wishlistAtom,
      wishlist.filter((id) => id !== productId)
    );
  } else {
    set(wishlistAtom, [...wishlist, productId]);
  }
});
