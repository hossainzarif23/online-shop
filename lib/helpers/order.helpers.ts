/**
 * Order Status Helpers
 */

import type { OrderStatus, PaymentStatus } from "@/types";

export const orderHelpers = {
  /**
   * Get color class for order status badge
   */
  getStatusColor(status: OrderStatus | string): string {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
      SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  },

  /**
   * Get color class for payment status
   */
  getPaymentStatusColor(status: PaymentStatus | string): string {
    const statusColors: Record<string, string> = {
      PENDING: "text-yellow-600",
      AUTHORIZED: "text-blue-600",
      CAPTURED: "text-green-600",
      FAILED: "text-red-600",
      REFUNDED: "text-gray-600",
    };
    return statusColors[status] || "text-gray-600";
  },

  /**
   * Get human-readable status text
   */
  getStatusLabel(status: string): string {
    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(status: OrderStatus): boolean {
    return ["PENDING", "PROCESSING"].includes(status);
  },

  /**
   * Check if order can be returned
   */
  canReturnOrder(status: OrderStatus, orderDate: Date): boolean {
    if (status !== "DELIVERED") return false;

    // Allow returns within 30 days
    const daysSinceOrder =
      (Date.now() - new Date(orderDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceOrder <= 30;
  },
};
