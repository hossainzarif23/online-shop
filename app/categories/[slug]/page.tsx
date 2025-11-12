"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { useCategory } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowUpDown } from "lucide-react";
import type { Product } from "@/types";

type SortOption = "newest" | "price-low" | "price-high" | "name";

async function getCategoryProducts(
  categorySlug: string,
  sortBy: SortOption = "newest"
): Promise<Product[]> {
  const res = await fetch(`/api/products?categorySlug=${categorySlug}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const products = await res.json();

  // Client-side sorting
  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return Number(a.price) - Number(b.price);
      case "price-high":
        return Number(b.price) - Number(a.price);
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  return sorted;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { data: category, isLoading: categoryLoading } = useCategory(slug);
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["category-products", slug, sortBy],
    queryFn: () => getCategoryProducts(slug, sortBy),
    enabled: !!slug,
  });

  const isLoading = categoryLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
              <p className="text-muted-foreground mb-8">
                The category you're looking for doesn't exist.
              </p>
              <Button asChild>
                <a href="/categories">Browse All Categories</a>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Categories", href: "/categories" },
              { label: category.name },
            ]}
            className="mb-6"
          />

          {/* Category Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {category.image && (
                <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-muted-foreground text-lg mb-4">
                    {category.description}
                  </p>
                )}
                {category.productCount !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          {products && products.length > 0 ? (
            <>
              {/* Sort Controls */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {products.length} products
                </p>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
