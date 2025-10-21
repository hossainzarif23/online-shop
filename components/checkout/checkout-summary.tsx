/**
 * CheckoutSummary Component
 * Displays order summary with items and totals
 */

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { priceHelpers } from "@/lib/helpers";
import type { CartItem } from "@/types";

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  isProcessing: boolean;
}

export function CheckoutSummary({
  items,
  subtotal,
  tax,
  shipping,
  total,
  isProcessing,
}: CheckoutSummaryProps) {
  return (
    <div className="bg-background border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.productId} className="flex space-x-4">
            <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {priceHelpers.formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{priceHelpers.formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (10%)</span>
          <span>{priceHelpers.formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              priceHelpers.formatPrice(shipping)
            )}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total</span>
          <span>{priceHelpers.formatPrice(total)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full mt-6"
        disabled={isProcessing}
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${priceHelpers.formatPrice(total)}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-4">
        By placing your order, you agree to our terms and conditions
      </p>
    </div>
  );
}
