/**
 * usePaymentMethods Hook - Migrated to React Query
 * Automatic caching, optimistic updates, and state management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  paymentService,
  type PaymentMethod,
} from "@/lib/services/payment.service";
import { toast } from "sonner";

// Query keys for cache management
export const paymentMethodKeys = {
  all: ["paymentMethods"] as const,
  lists: () => [...paymentMethodKeys.all, "list"] as const,
  list: (filters?: any) => [...paymentMethodKeys.lists(), filters] as const,
  details: () => [...paymentMethodKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentMethodKeys.details(), id] as const,
};

/**
 * Fetch and manage payment methods for the current user
 * Automatically caches and manages loading/error states
 */
export function usePaymentMethods() {
  const queryClient = useQueryClient();

  // Fetch payment methods
  const query = useQuery({
    queryKey: paymentMethodKeys.lists(),
    queryFn: () => paymentService.getPaymentMethods(),
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Delete payment method mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentService.deletePaymentMethod(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: paymentMethodKeys.lists() });

      const previousMethods = queryClient.getQueryData(
        paymentMethodKeys.lists()
      );

      // Optimistically remove from UI
      queryClient.setQueryData(
        paymentMethodKeys.lists(),
        (old: PaymentMethod[] = []) => old.filter((method) => method.id !== id)
      );

      return { previousMethods };
    },
    onSuccess: () => {
      toast.success("Payment method deleted successfully");
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousMethods) {
        queryClient.setQueryData(
          paymentMethodKeys.lists(),
          context.previousMethods
        );
      }
      toast.error(error.message || "Failed to delete payment method");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.lists() });
    },
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => paymentService.setDefaultPaymentMethod(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: paymentMethodKeys.lists() });

      const previousMethods = queryClient.getQueryData(
        paymentMethodKeys.lists()
      );

      // Optimistically update
      queryClient.setQueryData(
        paymentMethodKeys.lists(),
        (old: PaymentMethod[] = []) =>
          old.map((method) =>
            method.id === id
              ? { ...method, isDefault: true }
              : { ...method, isDefault: false }
          )
      );

      return { previousMethods };
    },
    onSuccess: () => {
      toast.success("Default payment method updated");
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousMethods) {
        queryClient.setQueryData(
          paymentMethodKeys.lists(),
          context.previousMethods
        );
      }
      toast.error(error.message || "Failed to update default payment method");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.lists() });
    },
  });

  return {
    paymentMethods: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    deletePaymentMethod: (id: string) => {
      if (confirm("Are you sure you want to delete this payment method?")) {
        deleteMutation.mutate(id);
      }
    },
    setDefaultPaymentMethod: setDefaultMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
  };
}
