import React from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface WishlistSheetProps {
  onProductClick?: (product: any) => void;
}

const WishlistSheet: React.FC<WishlistSheetProps> = ({ onProductClick }) => {
  const { items, removeFromWishlist, totalItems } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    const defaultWeight = product.weightOptions?.[0] || { weight: "250", price: product.price, unit: "g" };
    addToCart(product, 1, `${defaultWeight.weight}${defaultWeight.unit}`, defaultWeight.price);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Heart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground font-semibold">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" fill="currentColor" />
            Wishlist ({totalItems})
            <span className="text-sm font-normal text-muted-foreground tamil-text">விருப்பப்பட்டியல்</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Your wishlist is empty</p>
              <p className="text-sm text-muted-foreground tamil-text">உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது</p>
            </div>
          ) : (
            items.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <img
                  src={product.images[0]}
                  alt={product.nameEn}
                  className="h-20 w-20 rounded-lg object-cover bg-secondary cursor-pointer"
                  onClick={() => onProductClick?.(product)}
                />
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onProductClick?.(product)}
                  >
                    {product.nameEn}
                  </h4>
                  <p className="text-sm text-muted-foreground tamil-text truncate">{product.nameTa}</p>
                  <p className="text-lg font-bold text-primary mt-1">₹{product.price}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleAddToCart(product)}
                    className="h-8 w-8"
                    disabled={product.available === false}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromWishlist(product.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WishlistSheet;
