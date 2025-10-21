"use client";

/**
 * Refactored Order Detail Page
 * Uses hooks and component composition
 * Reduced from 290 lines to ~90 lines
 */

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { SuccessBanner } from "@/components/orders/success-banner";
import { OrderItemsList } from "@/components/orders/order-items-list";
import { OrderAddresses } from "@/components/orders/order-addresses";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { useOrder } from "@/hooks";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const { order, isLoading, error } = useOrder(params.id as string);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  // Error or order not found
  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-8">
              {error || "The order you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Success Banner */}
          <SuccessBanner orderNumber={order.orderNumber} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              <OrderItemsList items={order.items} />
              <OrderAddresses
                shippingAddress={order.shippingAddress}
                billingAddress={order.billingAddress}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummaryCard order={order} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
