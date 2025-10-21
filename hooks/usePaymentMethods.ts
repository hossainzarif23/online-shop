/**
 * Custom hook for fetching and managing payment methods
 */

import { useState, useEffect, useCallback } from "react";
import {
  paymentService,
  type PaymentMethod,
} from "@/lib/services/payment.service";
import { toast } from "sonner";

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await paymentService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load payment methods";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePaymentMethod = useCallback(async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this payment method?"
    );
    if (!confirmed) return;

    try {
      await paymentService.deletePaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
      toast.success("Payment method deleted successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete payment method";
      toast.error(message);
      throw err;
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    try {
      const updatedMethod = await paymentService.setDefaultPaymentMethod(id);
      // Update all payment methods - set the selected one as default, others as false
      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.id === id ? updatedMethod : { ...method, isDefault: false }
        )
      );
      toast.success("Default payment method updated");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update default payment method";
      toast.error(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    isLoading,
    error,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    refetch: fetchPaymentMethods,
  };
}
