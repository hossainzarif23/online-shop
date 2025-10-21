/**
 * OrderItemsList Component
 * Displays list of items in an order
 */

import Link from "next/link";
import { Package } from "lucide-react";
import { priceHelpers } from "@/lib/helpers";
import type { OrderItem } from "@/types";

interface OrderItemsListProps {
  items: OrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="bg-background border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Package className="h-5 w-5" />
        Order Items
      </h2>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0"
          >
            <div className="flex-1">
              <Link
                href={`/products/${item.product.slug}`}
                className="font-semibold hover:text-primary transition-colors"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                Quantity: {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">
                {priceHelpers.formatPrice(item.price)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: {priceHelpers.formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
