/**
 * Order Service
 * Handles all order-related API calls with enhanced tracking and fulfillment
 */

import { apiClient } from "./api-client";
import type { Order, CreateOrderDto } from "@/types";

export interface UpdateOrderStatusDto {
  status: string;
  message?: string;
  metadata?: Record<string, any>;
}

export interface UpdateFulfillmentDto {
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export interface ProcessRefundDto {
  amount: number;
  reason: string;
}

export interface CancelOrderDto {
  reason: string;
}

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

  /**
   * Update order status with timeline entry
   */
  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusDto
  ): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${orderId}/status`, data);
  },

  /**
   * Add fulfillment details (tracking number, carrier, etc.)
   */
  async updateFulfillment(
    orderId: string,
    data: UpdateFulfillmentDto
  ): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${orderId}/fulfillment`, data);
  },

  /**
   * Process a refund for an order
   */
  async processRefund(orderId: string, data: ProcessRefundDto): Promise<Order> {
    return apiClient.post<Order>(`/orders/${orderId}/refund`, data);
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, data: CancelOrderDto): Promise<Order> {
    return apiClient.post<Order>(`/orders/${orderId}/cancel`, data);
  },

  /**
   * Get order timeline (status history)
   */
  async getOrderTimeline(orderId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/orders/${orderId}/timeline`);
  },

  /**
   * Get shipping tracking information
   */
  async getTrackingInfo(orderId: string): Promise<any> {
    return apiClient.get<any>(`/orders/${orderId}/tracking`);
  },
};
