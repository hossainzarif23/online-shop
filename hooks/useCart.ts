/**
 * useCart Hook
 * Encapsulates cart state management and operations
 */

import { useAtom, useSetAtom } from "jotai";
import {
  cartItemsAtom,
  cartTotalAtom,
  removeFromCartAtom,
  updateCartItemQuantityAtom,
  clearCartAtom,
} from "@/stores/cart";
import { toast } from "sonner";
import { priceHelpers } from "@/lib/helpers";

export function useCart() {
  const [items] = useAtom(cartItemsAtom);
  const [subtotal] = useAtom(cartTotalAtom);
  const removeFromCart = useSetAtom(removeFromCartAtom);
  const updateQuantity = useSetAtom(updateCartItemQuantityAtom);
  const clearCart = useSetAtom(clearCartAtom);

  const tax = priceHelpers.calculateTax(subtotal);
  const shipping = priceHelpers.calculateShipping(subtotal);
  const total = priceHelpers.calculateTotal(subtotal, tax, shipping);

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    toast.success("Item removed from cart");
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity({ productId, quantity });
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  return {
    items,
    subtotal,
    tax,
    shipping,
    total,
    isEmpty: items.length === 0,
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    removeItem: handleRemoveItem,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
  };
}
