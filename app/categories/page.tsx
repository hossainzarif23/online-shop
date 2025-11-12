"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CategoryCard } from "@/components/categories/category-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Categories" }]} className="mb-6" />

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Shop by Category
            </h1>
            <p className="text-muted-foreground">
              Browse our wide selection of products organized by category
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-video rounded-lg mb-4"></div>
                  <div className="bg-muted h-6 w-3/4 rounded mb-2"></div>
                  <div className="bg-muted h-4 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Failed to load categories</p>
              <p className="text-muted-foreground text-sm">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && (!categories || categories.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          )}

          {/* Categories Grid */}
          {!isLoading && !error && categories && categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
