"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { ProductInfo } from "@/components/products/product-info";
import { ProductDescription } from "@/components/products/product-description";
import { RelatedProducts } from "@/components/products/related-products";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Product, Review } from "@/types";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";

async function getProduct(
  slug: string
): Promise<Product & { reviews?: Review[] }> {
  return productService.getProductBySlug(slug);
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduct(slug),
    enabled: !!slug,
  });

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

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-8">
                The product you're looking for doesn't exist or has been
                removed.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/products">Browse All Products</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/categories">Browse Categories</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Categories", href: "/categories" },
  ];

  if (product.category) {
    breadcrumbItems.push({
      label: product.category.name,
      href: `/categories/${product.category.slug}`,
    });
  }

  breadcrumbItems.push({ label: product.name });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Image Gallery */}
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />

            {/* Product Info */}
            <ProductInfo product={product} />
          </div>

          {/* Product Description Tabs */}
          <div className="mb-12">
            <ProductDescription product={product} />
          </div>

          {/* Related Products */}
          {product.categoryId && (
            <RelatedProducts
              categoryId={product.categoryId}
              currentProductId={product.id}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
