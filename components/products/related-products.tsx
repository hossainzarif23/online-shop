"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./product-card";
import { productService } from "@/lib/services/product.service";
import type { Product } from "@/types";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
  limit?: number;
  className?: string;
}

async function getRelatedProducts(
  categoryId: string,
  limit: number
): Promise<Product[]> {
  const res = await fetch(
    `/api/products?category=${categoryId}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch related products");
  return res.json();
}

export function RelatedProducts({
  categoryId,
  currentProductId,
  limit = 4,
  className,
}: RelatedProductsProps) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["related-products", categoryId, limit],
    queryFn: () => getRelatedProducts(categoryId, limit + 1), // Fetch one extra to exclude current
  });

  // Filter out current product
  const relatedProducts =
    products
      ?.filter((product) => product.id !== currentProductId)
      .slice(0, limit) || [];

  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-64 rounded-lg mb-4"></div>
            <div className="bg-muted h-4 w-3/4 rounded mb-2"></div>
            <div className="bg-muted h-4 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
