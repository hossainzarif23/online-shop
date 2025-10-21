/**
 * useCheckout Hook
 * Handles checkout form state and submission logic
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { clearCartAtom } from "@/stores/cart";
import { toast } from "sonner";
import { orderService, paymentService } from "@/lib/services";
import type { CartItem } from "@/types";

interface CheckoutAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface CheckoutPaymentData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface CheckoutFormData {
  billingAddress: CheckoutAddress;
  shippingAddress: CheckoutAddress;
  paymentData: CheckoutPaymentData;
  sameAsShipping?: boolean;
}

interface CheckoutTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function useCheckout(items: CartItem[], totals: CheckoutTotals) {
  const router = useRouter();
  const clearCart = useSetAtom(clearCartAtom);
  const [isProcessing, setIsProcessing] = useState(false);

  const processCheckout = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    try {
      // Process payment with Authorize.net
      const paymentResult = await paymentService.processPayment({
        amount: totals.total,
        cardNumber: data.paymentData.cardNumber.replace(/\s/g, ""),
        expiryMonth: data.paymentData.expiryMonth,
        expiryYear: data.paymentData.expiryYear,
        cvv: data.paymentData.cvv,
        cardholderName: data.paymentData.cardholderName,
        billingAddress: data.billingAddress,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment processing failed");
      }

      // Create order
      const order = await orderService.createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        paymentMethod: "CREDIT_CARD",
        transactionId: paymentResult.transactionId,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
      });

      // Clear cart
      clearCart();

      // Show success message
      toast.success("Order placed successfully!", {
        description: `Order #${order.orderNumber} has been created.`,
      });

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`);

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during checkout. Please try again.",
      });
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processCheckout,
  };
}
