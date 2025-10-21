/**
 * Address Service
 * Handles all address-related API calls
 */

import { apiClient } from "./api-client";

export interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  type: "SHIPPING" | "BILLING" | "BOTH";
}

export interface CreateAddressDto {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  type?: "SHIPPING" | "BILLING" | "BOTH";
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

export const addressService = {
  /**
   * Get all addresses for the current user
   */
  async getAddresses(): Promise<Address[]> {
    return apiClient.get<Address[]>("/profile/addresses");
  },

  /**
   * Get a single address by ID
   */
  async getAddressById(id: string): Promise<Address> {
    return apiClient.get<Address>(`/profile/addresses/${id}`);
  },

  /**
   * Create a new address
   */
  async createAddress(data: CreateAddressDto): Promise<Address> {
    return apiClient.post<Address>("/profile/addresses", data);
  },

  /**
   * Update an existing address
   */
  async updateAddress(id: string, data: UpdateAddressDto): Promise<Address> {
    return apiClient.patch<Address>(`/profile/addresses/${id}`, data);
  },

  /**
   * Delete an address
   */
  async deleteAddress(id: string): Promise<void> {
    return apiClient.delete<void>(`/profile/addresses/${id}`);
  },
};
