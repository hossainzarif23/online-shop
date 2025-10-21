/**
 * useOrders Hook - Migrated to React Query
 * Automatic caching, refetching, and state management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/lib/services/order.service";
import { toast } from "sonner";
import type { Order, CreateOrderDto } from "@/types";

// Query keys for cache management
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters?: any) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

/**
 * Fetch all orders for the current user
 * Automatically caches and manages loading/error states
 */
export function useOrders() {
  const query = useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderService.getOrders(),
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

/**
 * Fetch a single order by ID
 * Only fetches if ID is provided
 */
export function useOrder(id: string | null) {
  const query = useQuery({
    queryKey: orderKeys.detail(id!),
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id, // Only fetch if ID exists
    staleTime: 5 * 60 * 1000, // Order details stay fresh longer
  });

  return {
    order: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

/**
 * Create a new order
 * Automatically invalidates orders list cache on success
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderDto) =>
      orderService.createOrder(orderData),
    onSuccess: (newOrder) => {
      // Invalidate orders list to trigger refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      // Add new order to cache
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);

      toast.success("Order created successfully!", {
        description: `Order #${newOrder.orderNumber} has been placed.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create order", {
        description: error.message || "Please try again later.",
      });
    },
  });
}
