/**
 * Product Service
 * Handles all product-related API calls
 */

import { apiClient } from "./api-client";
import type { Product } from "@/types";

export const productService = {
  /**
   * Get all products
   */
  async getProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>("/products");
  },

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${slug}`);
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return apiClient.get<Product[]>(`/products?categoryId=${categoryId}`);
  },
};
