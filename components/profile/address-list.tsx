/**
 * AddressList Component
 * Displays a list of addresses with actions
 */

import { Button } from "@/components/ui/button";
import { Trash2, Edit, Home } from "lucide-react";
import { addressHelpers } from "@/lib/helpers/address.helpers";
import type { Address } from "@/lib/services/address.service";

interface AddressListProps {
  addresses: Address[];
  isLoading: boolean;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AddressList({
  addresses,
  isLoading,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No addresses saved
        </h3>
        <p className="text-gray-600">
          Add your first address to make checkout faster
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="border rounded-lg p-4 hover:border-gray-400 transition-colors relative"
        >
          {address.isDefault && (
            <div className="absolute top-2 right-2">
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Default
              </span>
            </div>
          )}

          <div className="mb-3">
            <p className="font-semibold text-gray-900">{address.fullName}</p>
            <p className="text-sm text-gray-600 mt-1">{address.addressLine1}</p>
            {address.addressLine2 && (
              <p className="text-sm text-gray-600">{address.addressLine2}</p>
            )}
            <p className="text-sm text-gray-600">
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="text-sm text-gray-600">{address.country}</p>
            <p className="text-sm text-gray-600 mt-2">Phone: {address.phone}</p>
            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {addressHelpers.getAddressTypeLabel(address.type)}
            </span>
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {!address.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(address.id)}
              >
                Set Default
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(address.id)}
              className="text-red-600 hover:text-red-700 ml-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
