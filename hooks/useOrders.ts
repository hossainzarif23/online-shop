/**
 * Custom hook for fetching and managing orders
 */

import { useState, useEffect, useCallback } from "react";
import { orderService } from "@/lib/services/order.service";
import type { Order } from "@/types";
import { toast } from "sonner";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}

export function useOrder(id: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load order";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrder,
  };
}
