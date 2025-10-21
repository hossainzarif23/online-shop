"use client";

/**
 * Refactored Cart Page
 * Uses component composition and hooks for clean, maintainable code
 * Reduced from 185 lines to ~50 lines
 */

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EmptyCart } from "@/components/cart/empty-cart";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const {
    items,
    subtotal,
    tax,
    shipping,
    total,
    isEmpty,
    itemCount,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {isEmpty ? (
            <EmptyCart />
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                <p className="text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.productId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <CartSummary
                    subtotal={subtotal}
                    tax={tax}
                    shipping={shipping}
                    total={total}
                    itemCount={itemCount}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
