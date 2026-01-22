import React, { useState } from "react";
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";
import StarRating from "./StarRating";

interface ProductCardProps {
  product: Product;
  onReadMore: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onReadMore }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const inWishlist = isInWishlist(product.id);

  // Get starting price from weight options or default price
  const weightOptions = product.weightOptions || [
    { weight: "250", price: product.price, unit: "g" }
  ];
  const startingPrice = Math.min(...weightOptions.map(w => w.price));
  const defaultWeight = weightOptions[0];

  // Quick add with default weight
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1, `${defaultWeight.weight}${defaultWeight.unit}`, defaultWeight.price);
    setTimeout(() => setIsAdding(false), 300);
  };

  // Check if product is available
  const isAvailable = product.available !== false;

  return (
    <Card 
      className={cn(
        "overflow-hidden product-card-hover shadow-card cursor-pointer transition-all group",
        !isAvailable && "opacity-60"
      )}
      onClick={() => onReadMore(product)}
    >
      <div className="aspect-square overflow-hidden bg-secondary/30 relative">
        <img
          src={product.images[0]}
          alt={product.nameEn}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={cn(
            "absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center",
            "bg-background/80 backdrop-blur-sm shadow-md transition-all duration-200",
            "hover:scale-110 hover:bg-background",
            inWishlist ? "text-destructive" : "text-muted-foreground hover:text-destructive"
          )}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
        </button>
        {!isAvailable && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">
              Temporarily Unavailable
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        {/* Product Name */}
        <div className="mb-2">
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.nameEn}
          </h3>
          <p className="text-sm text-muted-foreground tamil-text line-clamp-1">
            {product.nameTa}
          </p>
          {/* Star Rating */}
          <div className="mt-1">
            <StarRating rating={4.5} totalReviews={12} size="sm" />
          </div>
        </div>

        {/* Price */}
        <p className="mb-4 text-xl font-bold text-primary">
          {weightOptions.length > 1 ? (
            <>
              From ₹{startingPrice}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {defaultWeight.weight}{defaultWeight.unit}
              </span>
            </>
          ) : (
            <>
              ₹{product.price}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {product.category === 'pickles' ? '200g' : '250g'}
              </span>
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onReadMore(product);
            }}
          >
            <Eye className="h-4 w-4" />
            <span>Read More</span>
            <span className="text-xs tamil-text hidden sm:inline">மேலும் படிக்க</span>
          </Button>
          
          <Button
            className={cn(
              "w-full gap-2 transition-all",
              isAdding && "scale-95"
            )}
            onClick={handleQuickAdd}
            disabled={!isAvailable}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
            <span className="text-xs tamil-text hidden sm:inline">கார்ட்டில் சேர்</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
