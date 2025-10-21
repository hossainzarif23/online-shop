/**
 * Custom hook for fetching and managing addresses
 */

import { useState, useEffect, useCallback } from "react";
import {
  addressService,
  type Address,
  type CreateAddressDto,
  type UpdateAddressDto,
} from "@/lib/services/address.service";
import { toast } from "sonner";

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load addresses";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAddress = useCallback(async (data: CreateAddressDto) => {
    try {
      const newAddress = await addressService.createAddress(data);
      setAddresses((prev) => [...prev, newAddress]);
      toast.success("Address added successfully");
      return newAddress;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add address";
      toast.error(message);
      throw err;
    }
  }, []);

  const updateAddress = useCallback(
    async (id: string, data: UpdateAddressDto) => {
      try {
        const updatedAddress = await addressService.updateAddress(id, data);
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === id ? updatedAddress : addr))
        );
        toast.success("Address updated successfully");
        return updatedAddress;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update address";
        toast.error(message);
        throw err;
      }
    },
    []
  );

  const deleteAddress = useCallback(async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this address?");
    if (!confirmed) return;

    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      toast.success("Address deleted successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete address";
      toast.error(message);
      throw err;
    }
  }, []);

  const setDefaultAddress = useCallback(async (id: string) => {
    try {
      const updatedAddress = await addressService.updateAddress(id, {
        isDefault: true,
      });
      // Update all addresses - set the selected one as default, others as false
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === id ? updatedAddress : { ...addr, isDefault: false }
        )
      );
      toast.success("Default address updated");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update default address";
      toast.error(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return {
    addresses,
    isLoading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses,
  };
}
