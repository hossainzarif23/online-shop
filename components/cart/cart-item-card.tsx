/**
 * CartItemCard Component
 * Displays a single cart item with quantity controls
 */

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";
import { priceHelpers } from "@/lib/helpers";
import type { CartItem } from "@/types";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const handleDecrement = () => {
    onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1));
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.productId, Math.min(item.stock, item.quantity + 1));
  };

  const itemTotal = item.price * item.quantity;
  const isMaxQuantity = item.quantity >= item.stock;

  return (
    <div className="flex gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`}>
          <h3 className="font-semibold hover:text-primary transition-colors truncate">
            {item.name}
          </h3>
        </Link>
        <p className="text-lg font-bold mt-1">
          {priceHelpers.formatPrice(item.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrement}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="w-12 text-center font-medium">{item.quantity}</span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrement}
            disabled={isMaxQuantity}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {isMaxQuantity && (
            <span className="text-xs text-muted-foreground ml-2">
              Max available
            </span>
          )}
        </div>

        {/* Stock Warning */}
        {item.stock < 10 && (
          <p className="text-xs text-orange-600 mt-2">
            Only {item.stock} left in stock
          </p>
        )}
      </div>

      {/* Actions & Total */}
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.productId)}
          aria-label="Remove item"
          className="hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-bold text-lg">
            {priceHelpers.formatPrice(itemTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
