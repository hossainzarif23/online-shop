"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviews } from "./product-reviews";
import type { Product, Review } from "@/types";

interface ProductDescriptionProps {
  product: Product & { reviews?: Review[] };
  className?: string;
}

export function ProductDescription({
  product,
  className,
}: ProductDescriptionProps) {
  return (
    <Tabs defaultValue="description" className={className}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">
          Reviews{" "}
          {product.reviews &&
            product.reviews.length > 0 &&
            `(${product.reviews.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-muted-foreground">
            {product.description || "No description available."}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <div className="space-y-4">
          <table className="w-full border-collapse">
            <tbody className="divide-y">
              {product.sku && (
                <tr>
                  <td className="py-3 px-4 font-medium bg-muted/50">SKU</td>
                  <td className="py-3 px-4">{product.sku}</td>
                </tr>
              )}
              {product.category && (
                <tr>
                  <td className="py-3 px-4 font-medium bg-muted/50">
                    Category
                  </td>
                  <td className="py-3 px-4">{product.category.name}</td>
                </tr>
              )}
              <tr>
                <td className="py-3 px-4 font-medium bg-muted/50">Stock</td>
                <td className="py-3 px-4">
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium bg-muted/50">Status</td>
                <td className="py-3 px-4">
                  {product.published ? "Published" : "Unpublished"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        {product.reviews && product.reviews.length > 0 ? (
          <ProductReviews reviews={product.reviews} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review!
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
