/**
 * useAddresses Hook - Migrated to React Query
 * Automatic caching, optimistic updates, and state management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addressService,
  type Address,
  type CreateAddressDto,
  type UpdateAddressDto,
} from "@/lib/services/address.service";
import { toast } from "sonner";

// Query keys for cache management
export const addressKeys = {
  all: ["addresses"] as const,
  lists: () => [...addressKeys.all, "list"] as const,
  list: (filters?: any) => [...addressKeys.lists(), filters] as const,
  details: () => [...addressKeys.all, "detail"] as const,
  detail: (id: string) => [...addressKeys.details(), id] as const,
};

/**
 * Fetch all addresses for the current user
 * Automatically caches and manages loading/error states
 */
export function useAddresses() {
  const queryClient = useQueryClient();

  // Fetch addresses
  const query = useQuery({
    queryKey: addressKeys.lists(),
    queryFn: () => addressService.getAddresses(),
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Create address mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAddressDto) => addressService.createAddress(data),
    onMutate: async (newAddress) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: addressKeys.lists() });

      // Snapshot the previous value
      const previousAddresses = queryClient.getQueryData(addressKeys.lists());

      // Optimistically update to the new value
      queryClient.setQueryData(addressKeys.lists(), (old: Address[] = []) => [
        ...old,
        { ...newAddress, id: "temp-" + Date.now() } as Address,
      ]);

      return { previousAddresses };
    },
    onSuccess: () => {
      toast.success("Address added successfully");
    },
    onError: (error: Error, _newAddress, context) => {
      // Rollback on error
      if (context?.previousAddresses) {
        queryClient.setQueryData(
          addressKeys.lists(),
          context.previousAddresses
        );
      }
      toast.error(error.message || "Failed to add address");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });

  // Update address mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressDto }) =>
      addressService.updateAddress(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.lists() });

      const previousAddresses = queryClient.getQueryData(addressKeys.lists());

      queryClient.setQueryData(addressKeys.lists(), (old: Address[] = []) =>
        old.map((addr) => (addr.id === id ? { ...addr, ...data } : addr))
      );

      return { previousAddresses };
    },
    onSuccess: () => {
      toast.success("Address updated successfully");
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(
          addressKeys.lists(),
          context.previousAddresses
        );
      }
      toast.error(error.message || "Failed to update address");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });

  // Delete address mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.lists() });

      const previousAddresses = queryClient.getQueryData(addressKeys.lists());

      // Optimistically remove from UI
      queryClient.setQueryData(addressKeys.lists(), (old: Address[] = []) =>
        old.filter((addr) => addr.id !== id)
      );

      return { previousAddresses };
    },
    onSuccess: () => {
      toast.success("Address deleted successfully");
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(
          addressKeys.lists(),
          context.previousAddresses
        );
      }
      toast.error(error.message || "Failed to delete address");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) =>
      addressService.updateAddress(id, { isDefault: true }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.lists() });

      const previousAddresses = queryClient.getQueryData(addressKeys.lists());

      // Optimistically update
      queryClient.setQueryData(addressKeys.lists(), (old: Address[] = []) =>
        old.map((addr) =>
          addr.id === id
            ? { ...addr, isDefault: true }
            : { ...addr, isDefault: false }
        )
      );

      return { previousAddresses };
    },
    onSuccess: () => {
      toast.success("Default address updated");
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(
          addressKeys.lists(),
          context.previousAddresses
        );
      }
      toast.error(error.message || "Failed to update default address");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });

  return {
    addresses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createAddress: createMutation.mutate,
    updateAddress: (id: string, data: UpdateAddressDto) =>
      updateMutation.mutate({ id, data }),
    deleteAddress: (id: string) => {
      if (confirm("Are you sure you want to delete this address?")) {
        deleteMutation.mutate(id);
      }
    },
    setDefaultAddress: setDefaultMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
