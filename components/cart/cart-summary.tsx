/**
 * CartSummary Component
 * Displays order summary with totals and checkout button
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { priceHelpers } from "@/lib/helpers";

interface CartSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export function CartSummary({
  subtotal,
  tax,
  shipping,
  total,
  itemCount,
}: CartSummaryProps) {
  return (
    <div className="border rounded-lg p-6 sticky top-20 bg-background">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="h-5 w-5" />
        <h2 className="text-xl font-bold">Order Summary</h2>
      </div>

      {/* Items Count */}
      <p className="text-sm text-muted-foreground mb-4">
        {itemCount} {itemCount === 1 ? "item" : "items"} in cart
      </p>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-medium">{priceHelpers.formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Tax (10%)</span>
          <span className="font-medium">{priceHelpers.formatPrice(tax)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              priceHelpers.formatPrice(shipping)
            )}
          </span>
        </div>

        {/* Free Shipping Notice */}
        {shipping > 0 && subtotal < 50 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs text-blue-800">
            Add {priceHelpers.formatPrice(50 - subtotal)} more for FREE shipping!
          </div>
        )}

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{priceHelpers.formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button className="w-full" size="lg" asChild>
          <Link href="/checkout">
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-center text-muted-foreground">
          🔒 Secure checkout with SSL encryption
        </p>
      </div>
    </div>
  );
}
