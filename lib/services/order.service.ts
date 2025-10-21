/**
 * Order Service
 * Handles all order-related API calls
 */

import { apiClient } from "./api-client";
import type { Order, CreateOrderDto } from "@/types";

export const orderService = {
  /**
   * Get all orders for the current user
   */
  async getOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>("/orders");
  },

  /**
   * Get a single order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDto): Promise<Order> {
    return apiClient.post<Order>("/orders", data);
  },
};
