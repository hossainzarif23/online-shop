/**
 * Category Service
 * Handles all category-related API calls
 */

import { apiClient } from "./api-client";
import type { Category } from "@/types";

export interface CategoryWithCount extends Category {
  productCount?: number;
  children?: Category[];
}

export const categoryService = {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>("/categories");
  },

  /**
   * Get a single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryWithCount> {
    return apiClient.get<CategoryWithCount>(`/categories/${slug}`);
  },
};
