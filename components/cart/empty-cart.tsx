/**
 * EmptyCart Component
 * Displays empty cart state with call to action
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
        <div className="relative bg-muted rounded-full p-8">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
        </div>
      </div>

      {/* Message */}
      <h2 className="text-3xl font-bold mb-2">Your Cart is Empty</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Looks like you haven't added any items to your cart yet. Start shopping
        to find amazing products!
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" asChild>
          <Link href="/products">
            <Package className="mr-2 h-5 w-5" />
            Browse Products
          </Link>
        </Button>
        
        <Button variant="outline" size="lg" asChild>
          <Link href="/">
            Go to Homepage
          </Link>
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-2xl">
        <div className="text-center">
          <div className="text-2xl mb-2">🚚</div>
          <p className="text-sm font-medium">Free Shipping</p>
          <p className="text-xs text-muted-foreground">On orders over $50</p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-sm font-medium">Secure Payment</p>
          <p className="text-xs text-muted-foreground">SSL encrypted</p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl mb-2">↩️</div>
          <p className="text-sm font-medium">Easy Returns</p>
          <p className="text-xs text-muted-foreground">30-day guarantee</p>
        </div>
      </div>
    </div>
  );
}
