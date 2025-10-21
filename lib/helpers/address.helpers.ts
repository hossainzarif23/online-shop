/**
 * Address Formatting Helpers
 */

import type { Address } from "@/lib/services/address.service";

// Base address interface (without optional id, isDefault, type)
interface BaseAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export const addressHelpers = {
  /**
   * Format full address as a single string
   */
  formatFullAddress(address: Address | BaseAddress): string {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  },

  /**
   * Format address for display in multiple lines
   */
  formatMultilineAddress(address: Address | BaseAddress): string {
    return [
      address.fullName,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
      `Phone: ${address.phone}`,
    ]
      .filter(Boolean)
      .join("\n");
  },

  /**
   * Get address type label
   */
  getAddressTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      SHIPPING: "Shipping",
      BILLING: "Billing",
      BOTH: "Shipping & Billing",
    };
    return labels[type] || type;
  },

  /**
   * Validate postal code format (basic validation)
   */
  isValidPostalCode(postalCode: string, country: string = "US"): boolean {
    const patterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/,
      UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/,
    };

    const pattern = patterns[country];
    return pattern ? pattern.test(postalCode) : true;
  },
};
