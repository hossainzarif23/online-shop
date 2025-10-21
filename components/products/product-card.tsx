"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useAtom, useSetAtom } from "jotai";
import { addToCartAtom } from "@/stores/cart";
import { toggleWishlistAtom, isInWishlistAtom } from "@/stores/wishlist";
import { toast } from "sonner";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useSetAtom(addToCartAtom);
  const toggleWishlist = useSetAtom(toggleWishlistAtom);
  const [isInWishlist] = useAtom(isInWishlistAtom);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      image: product.images[0] || "/placeholder.png",
      slug: product.slug,
      stock: product.stock,
    });
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    if (isInWishlist(product.id)) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to wishlist!");
    }
  };

  const discount = product.comparePrice
    ? calculateDiscount(Number(product.price), Number(product.comparePrice))
    : 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-sm font-semibold">
              -{discount}%
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice &&
            Number(product.comparePrice) > Number(product.price) && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button variant="outline" size="icon" onClick={handleToggleWishlist}>
          <Heart
            className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current text-destructive" : ""}`}
          />
        </Button>
      </CardFooter>
    </Card>
  );
}
