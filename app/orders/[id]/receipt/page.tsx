"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, ArrowLeft, Download } from "lucide-react";
import type { Order } from "@/types";

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading receipt...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">
              ❌ Receipt Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find an order with ID: {orderId}
            </p>
            <Button onClick={() => router.push("/orders")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Action Buttons - Hidden on print */}
      <div className="flex gap-3 mb-6 print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Download className="w-4 h-4 mr-2" />
          Save as PDF
        </Button>
      </div>

      {/* Receipt Card */}
      <Card className="shadow-lg">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">🧾 Order Receipt</h1>
            <p className="text-lg opacity-90">Thank you for your purchase!</p>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Order Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">
                Order Information
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Order Number:</span>
                  <p className="font-semibold text-lg">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Date:</span>
                  <p className="font-medium">
                    {orderDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Status:</span>
                  <p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">
                Payment Information
              </h2>
              <div className="space-y-2 text-sm">
                {order.transactionId && (
                  <div>
                    <span className="text-muted-foreground">
                      Transaction ID:
                    </span>
                    <p className="font-mono text-xs mt-1 bg-muted p-2 rounded">
                      {order.transactionId}
                    </p>
                  </div>
                )}
                {order.authorizationCode && (
                  <div>
                    <span className="text-muted-foreground">
                      Authorization Code:
                    </span>
                    <p className="font-semibold">{order.authorizationCode}</p>
                  </div>
                )}
                {order.receiptNumber && (
                  <div>
                    <span className="text-muted-foreground">
                      Receipt Number:
                    </span>
                    <p className="font-semibold">{order.receiptNumber}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Status:</span>
                  <p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping & Billing Addresses */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">
                Shipping Address
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b pb-2">
                Billing Address
              </h2>
              <div className="text-sm space-y-1">
                {order.billingAddress ? (
                  <>
                    <p className="font-medium">
                      {order.billingAddress.fullName}
                    </p>
                    <p>{order.billingAddress.addressLine1}</p>
                    {order.billingAddress.addressLine2 && (
                      <p>{order.billingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.state}{" "}
                      {order.billingAddress.postalCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                    <p className="text-muted-foreground">
                      {order.billingAddress.phone}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Same as shipping address
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Item
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Price
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Qty
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4 font-semibold">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                ${Number(order.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span className="font-medium">
                ${Number(order.tax).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping:</span>
              <span className="font-medium">
                ${Number(order.shipping).toFixed(2)}
              </span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span className="font-medium">
                  -${Number(order.discount).toFixed(2)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xl font-bold text-primary">
              <span>Grand Total:</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/30 rounded-lg p-6 text-center space-y-2 mt-8">
            <p className="font-semibold">Questions about your order?</p>
            <p className="text-sm text-muted-foreground">
              Contact us at support@example.com or call 1-800-SHOP-NOW
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              This is an official receipt for your records.
              <br />
              {order.paymentProvider && (
                <>Powered by {order.paymentProvider} Payment Gateway</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
