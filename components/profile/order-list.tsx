/**
 * OrderList Component
 * Displays a list of orders with details
 */

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MapPin } from "lucide-react";
import { priceHelpers } from "@/lib/helpers/price.helpers";
import { dateHelpers } from "@/lib/helpers/date.helpers";
import { orderHelpers } from "@/lib/helpers/order.helpers";
import type { Order } from "@/types";

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
}

export function OrderList({ orders, isLoading }: OrderListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-600 mb-4">
          Start shopping to see your orders here
        </p>
        <Button onClick={() => router.push("/products")}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Order Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    Order Number
                  </p>
                  <p className="font-semibold text-gray-900">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    Order Date
                  </p>
                  <p className="font-medium text-gray-900">
                    {dateHelpers.formatLongDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">
                    Total
                  </p>
                  <p className="font-semibold text-gray-900">
                    {priceHelpers.formatPrice(order.total)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${orderHelpers.getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {priceHelpers.formatPrice(item.price)} each
                    </p>
                  </div>

                  {/* Item Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">
                      {priceHelpers.formatPrice(
                        typeof item.price === "string"
                          ? parseFloat(item.price) * item.quantity
                          : item.price * item.quantity
                      )}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 text-blue-600 p-0 h-auto"
                      onClick={() =>
                        router.push(`/products/${item.product.slug}`)
                      }
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-wrap gap-8">
                {/* Shipping Address */}
                <div className="flex-1 min-w-[200px]">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Order Totals */}
                <div className="flex-1 min-w-[200px]">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {priceHelpers.formatPrice(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {priceHelpers.formatPrice(order.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">
                        {priceHelpers.formatPrice(order.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">
                        {priceHelpers.formatPrice(order.total)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-600">Payment Status</span>
                      <span
                        className={`font-semibold ${orderHelpers.getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
