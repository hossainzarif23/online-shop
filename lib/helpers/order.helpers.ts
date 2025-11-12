/**
 * Order Status Helpers
 * Enhanced for comprehensive order lifecycle management
 */

import type { OrderStatus, PaymentStatus, FulfillmentStatus } from "@/types";

export const orderHelpers = {
  /**
   * Get color class for order status badge
   */
  getStatusColor(status: OrderStatus | string): string {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PAYMENT_PENDING: "bg-orange-100 text-orange-800 border-orange-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      PROCESSING: "bg-indigo-100 text-indigo-800 border-indigo-200",
      SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
      OUT_FOR_DELIVERY: "bg-violet-100 text-violet-800 border-violet-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
      FAILED: "bg-rose-100 text-rose-800 border-rose-200",
      ON_HOLD: "bg-amber-100 text-amber-800 border-amber-200",
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
      PARTIALLY_CAPTURED: "text-teal-600",
      FAILED: "text-red-600",
      DECLINED: "text-rose-600",
      CANCELLED: "text-gray-600",
      REFUNDED: "text-slate-600",
      PARTIALLY_REFUNDED: "text-slate-500",
      EXPIRED: "text-orange-600",
      PENDING_REVIEW: "text-amber-600",
    };
    return statusColors[status] || "text-gray-600";
  },

  /**
   * Get color class for fulfillment status
   */
  getFulfillmentStatusColor(status: FulfillmentStatus | string): string {
    const statusColors: Record<string, string> = {
      UNFULFILLED: "bg-gray-100 text-gray-800 border-gray-200",
      PARTIALLY_FULFILLED: "bg-blue-100 text-blue-800 border-blue-200",
      FULFILLED: "bg-green-100 text-green-800 border-green-200",
      RESTOCKED: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
   * Get status icon (emoji)
   */
  getStatusIcon(status: OrderStatus | string): string {
    const icons: Record<string, string> = {
      PENDING: "⏳",
      PAYMENT_PENDING: "💳",
      CONFIRMED: "✅",
      PROCESSING: "📦",
      SHIPPED: "🚚",
      OUT_FOR_DELIVERY: "🚛",
      DELIVERED: "✨",
      CANCELLED: "❌",
      REFUNDED: "💰",
      FAILED: "⚠️",
      ON_HOLD: "⏸️",
    };
    return icons[status] || "📄";
  },

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(status: OrderStatus): boolean {
    return ["PENDING", "PAYMENT_PENDING", "CONFIRMED", "PROCESSING"].includes(
      status
    );
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

  /**
   * Check if order can be refunded
   */
  canRefundOrder(status: OrderStatus, paymentStatus: PaymentStatus): boolean {
    const validOrderStatuses: OrderStatus[] = [
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];
    const validPaymentStatuses: PaymentStatus[] = [
      "AUTHORIZED",
      "CAPTURED",
      "PARTIALLY_CAPTURED",
    ];

    return (
      validOrderStatuses.includes(status) &&
      validPaymentStatuses.includes(paymentStatus)
    );
  },

  /**
   * Get next possible statuses for an order
   */
  getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["PAYMENT_PENDING", "CANCELLED"],
      PAYMENT_PENDING: ["CONFIRMED", "FAILED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "ON_HOLD", "CANCELLED"],
      PROCESSING: ["SHIPPED", "ON_HOLD", "CANCELLED"],
      SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
      OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
      DELIVERED: ["REFUNDED"],
      CANCELLED: [],
      REFUNDED: [],
      FAILED: ["PENDING"],
      ON_HOLD: ["PROCESSING", "CANCELLED"],
    };

    return statusFlow[currentStatus] || [];
  },

  /**
   * Check if tracking is available
   */
  hasTracking(order: {
    trackingNumber?: string | null;
    carrier?: string | null;
  }): boolean {
    return !!(order.trackingNumber && order.carrier);
  },

  /**
   * Format tracking number for display
   */
  formatTrackingNumber(trackingNumber: string): string {
    // Add spaces for readability (e.g., "1Z999AA10123456784" -> "1Z 999 AA1 0123 4567 84")
    if (trackingNumber.startsWith("1Z")) {
      // UPS format
      return trackingNumber.replace(
        /^(1Z)([0-9A-Z]{3})([0-9A-Z]{3})([0-9]{10})$/,
        "$1 $2 $3 $4"
      );
    }
    return trackingNumber;
  },

  /**
   * Get estimated delivery status message
   */
  getDeliveryStatusMessage(order: {
    status: OrderStatus;
    estimatedDelivery?: Date | string | null;
    deliveredAt?: Date | string | null;
  }): string {
    if (order.deliveredAt) {
      return `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}`;
    }

    if (order.estimatedDelivery) {
      const estDate = new Date(order.estimatedDelivery);
      const today = new Date();
      const diffDays = Math.ceil(
        (estDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays < 0) {
        return "Delivery delayed - check tracking for details";
      } else if (diffDays === 0) {
        return "Estimated delivery: Today";
      } else if (diffDays === 1) {
        return "Estimated delivery: Tomorrow";
      } else {
        return `Estimated delivery: ${estDate.toLocaleDateString()}`;
      }
    }

    if (order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY") {
      return "In transit - check tracking for details";
    }

    return "";
  },

  /**
   * Calculate order completion percentage
   */
  getCompletionPercentage(status: OrderStatus): number {
    const statusProgress: Record<OrderStatus, number> = {
      PENDING: 10,
      PAYMENT_PENDING: 20,
      CONFIRMED: 30,
      PROCESSING: 50,
      SHIPPED: 70,
      OUT_FOR_DELIVERY: 90,
      DELIVERED: 100,
      CANCELLED: 0,
      REFUNDED: 0,
      FAILED: 0,
      ON_HOLD: 40,
    };
    return statusProgress[status] || 0;
  },
};
