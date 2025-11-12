/**
 * useCategories Hook - React Query Integration
 * Handles category data fetching with automatic caching
 */

import { useQuery } from "@tanstack/react-query";
import {
  categoryService,
  type CategoryWithCount,
} from "@/lib/services/category.service";

// Query keys for cache management
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: any) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
};

/**
 * Fetch all categories
 * Automatically caches and manages loading/error states
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single category by slug
 * Automatically caches and manages loading/error states
 */
export function useCategory(slug: string | null) {
  return useQuery({
    queryKey: categoryKeys.detail(slug || ""),
    queryFn: () => {
      if (!slug) throw new Error("Category slug is required");
      return categoryService.getCategoryBySlug(slug);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
