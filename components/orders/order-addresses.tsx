/**
 * OrderAddresses Component
 * Displays shipping and billing addresses for an order
 */

import { Truck, Home } from "lucide-react";
import { addressHelpers } from "@/lib/helpers";

interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface OrderAddressesProps {
  shippingAddress?: Address;
  billingAddress?: Address;
}

export function OrderAddresses({
  shippingAddress,
  billingAddress,
}: OrderAddressesProps) {
  return (
    <>
      {/* Shipping Address */}
      {shippingAddress && (
        <div className="bg-background border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Address
          </h2>
          <div className="text-sm whitespace-pre-line">
            {addressHelpers.formatMultilineAddress(shippingAddress)}
          </div>
        </div>
      )}

      {/* Billing Address */}
      {billingAddress && (
        <div className="bg-background border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Home className="h-5 w-5" />
            Billing Address
          </h2>
          <div className="text-sm whitespace-pre-line">
            {addressHelpers.formatMultilineAddress(billingAddress)}
          </div>
        </div>
      )}
    </>
  );
}
