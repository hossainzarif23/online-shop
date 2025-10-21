/**
 * Payment Service
 * Handles all payment and payment method related API calls
 */

import { apiClient } from "./api-client";

export interface PaymentMethod {
  id: string;
  cardLast4: string;
  cardBrand: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardholderName: string;
  isDefault: boolean;
}

export interface PaymentRequestDto {
  amount: number;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const paymentService = {
  /**
   * Get all payment methods for the current user
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get<PaymentMethod[]>("/profile/payment-methods");
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(id: string): Promise<void> {
    return apiClient.delete<void>(`/profile/payment-methods/${id}`);
  },

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    return apiClient.patch<PaymentMethod>(`/profile/payment-methods/${id}`, {
      isDefault: true,
    });
  },

  /**
   * Process a payment through Authorize.Net
   */
  async processPayment(data: PaymentRequestDto): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>("/payment/authorize", data);
  },
};
