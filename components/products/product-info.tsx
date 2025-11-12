"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Package, CheckCircle2 } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useAtom, useSetAtom } from "jotai";
import { addToCartAtom } from "@/stores/cart";
import { toggleWishlistAtom, isInWishlistAtom } from "@/stores/wishlist";
import { toast } from "sonner";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: Product;
  className?: string;
}

export function ProductInfo({ product, className }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useSetAtom(addToCartAtom);
  const toggleWishlist = useSetAtom(toggleWishlistAtom);
  const [isInWishlist] = useAtom(isInWishlistAtom);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: quantity,
      image: product.images[0] || "/placeholder.png",
      slug: product.slug,
      stock: product.stock,
    });
    toast.success("Added to cart!");
    setQuantity(1);
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

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Category Link */}
      {product.category && (
        <Link
          href={`/categories/${product.category.slug}`}
          className="text-sm text-primary hover:underline"
        >
          {product.category.name}
        </Link>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

      {/* Price */}
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
        {product.comparePrice &&
          Number(product.comparePrice) > Number(product.price) && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
              {discount > 0 && (
                <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm font-semibold">
                  Save {discount}%
                </span>
              )}
            </>
          )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <div className="flex items-center gap-2 text-destructive">
            <Package className="h-5 w-5" />
            <span className="font-medium">Out of Stock</span>
          </div>
        ) : isLowStock ? (
          <div className="flex items-center gap-2 text-orange-600">
            <Package className="h-5 w-5" />
            <span className="font-medium">
              Only {product.stock} left in stock
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">In Stock</span>
          </div>
        )}
      </div>

      {/* SKU */}
      {product.sku && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">SKU:</span> {product.sku}
        </div>
      )}

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <label htmlFor="quantity" className="font-medium">
            Quantity:
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <input
              id="quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, Math.min(val, product.stock)));
              }}
              className="w-16 text-center border rounded-md py-2"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
            >
              +
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleToggleWishlist}
          className="sm:w-auto"
        >
          <Heart
            className={cn(
              "h-5 w-5 mr-2",
              isInWishlist(product.id) && "fill-current text-destructive"
            )}
          />
          Wishlist
        </Button>
      </div>

      {/* Description Preview */}
      {product.description && (
        <div className="pt-4 border-t">
          <p className="text-muted-foreground line-clamp-3">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
}
