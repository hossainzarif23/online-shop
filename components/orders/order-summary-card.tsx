/**
 * OrderSummaryCard Component
 * Displays order summary with totals and actions
 */

import Link from "next/link";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { priceHelpers, dateHelpers, orderHelpers } from "@/lib/helpers";
import type { Order } from "@/types";

interface OrderSummaryCardProps {
  order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <div className="bg-background border rounded-lg p-6 sticky top-20 space-y-4">
      <h2 className="text-xl font-bold">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Number</span>
          <span className="font-semibold">#{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Date</span>
          <span>{dateHelpers.formatLongDate(order.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span
            className={`capitalize font-medium ${orderHelpers.getStatusColor(
              order.status
            )}`}
          >
            {order.status.toLowerCase().replace("_", " ")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment Status</span>
          <span
            className={`capitalize font-medium ${orderHelpers.getPaymentStatusColor(
              order.paymentStatus
            )}`}
          >
            {order.paymentStatus.toLowerCase().replace("_", " ")}
          </span>
        </div>
        {order.transactionId && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-xs">{order.transactionId}</span>
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{priceHelpers.formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{priceHelpers.formatPrice(order.tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            {order.shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              priceHelpers.formatPrice(order.shipping)
            )}
          </span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{priceHelpers.formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <Button className="w-full" asChild>
          <Link href={`/orders/${order.id}/receipt`}>
            <Receipt className="w-4 h-4 mr-2" />
            View Receipt
          </Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/profile">View All Orders</Link>
        </Button>
      </div>
    </div>
  );
}
