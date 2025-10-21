"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./product-card";
import type { Product } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  const res = await fetch("/api/products?featured=true&limit=6");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export function FeaturedProducts() {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: getFeaturedProducts,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-64 rounded-lg mb-4"></div>
            <div className="bg-muted h-4 w-3/4 rounded mb-2"></div>
            <div className="bg-muted h-4 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load products</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
