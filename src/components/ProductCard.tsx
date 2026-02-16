import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";
import StarRating from "./StarRating";
import { fetchReviewStats } from "@/services/api";

interface ProductCardProps {
  product: Product;
  onReadMore: (product: Product) => void;
}

const BADGE_STYLES: Record<string, { bg: string; text: string; animation: string }> = {
  new: { bg: 'bg-emerald-500', text: 'New', animation: 'animate-pulse' },
  hot: { bg: 'bg-red-500', text: '🔥 Hot', animation: 'animate-bounce' },
  'top-seller': { bg: 'bg-amber-500', text: '⭐ Top Seller', animation: '' },
  limited: { bg: 'bg-purple-500', text: 'Limited', animation: 'animate-pulse' },
  custom: { bg: 'bg-blue-500', text: 'Special', animation: '' },
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onReadMore }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [reviewStats, setReviewStats] = useState({ reviewCount: 0, averageRating: 0 });
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const inWishlist = isInWishlist(product.id);

  // Get weight options
  const weightOptions = product.weightOptions?.length ? product.weightOptions : [
    { weight: "250", price: product.price, unit: "g" }
  ];
  const currentWeight = weightOptions[selectedWeightIdx];
  const currentPrice = currentWeight.price;

  // Fetch dynamic review stats
  useEffect(() => {
    fetchReviewStats(product.id).then(res => {
      if (res.success) setReviewStats(res.data);
    }).catch(() => { });
  }, [product.id]);

  // Quick add with selected weight
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1, currentWeight.weight, currentPrice);
    setTimeout(() => setIsAdding(false), 300);
  };

  const isAvailable = product.available !== false;
  const badge = product.badge && BADGE_STYLES[product.badge];

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
        {/* Badge - Top Left */}
        {badge && (
          <span
            className={cn(
              "absolute top-2 left-2 px-2 py-1 rounded-full text-white text-[10px] md:text-xs font-bold shadow-md z-10",
              badge.bg,
              badge.animation
            )}
          >
            {badge.text}
          </span>
        )}
        {/* Wishlist Button - Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={cn(
            "absolute top-2 right-2 h-8 w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center",
            "bg-background/80 backdrop-blur-sm shadow-md transition-all duration-200",
            "hover:scale-110 hover:bg-background active:scale-95",
            inWishlist ? "text-destructive" : "text-muted-foreground hover:text-destructive"
          )}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4 md:h-5 md:w-5", inWishlist && "fill-current")} />
        </button>
        {!isAvailable && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs md:text-sm font-medium">
              Unavailable
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-3 md:p-4">
        {/* Product Name */}
        <div className="mb-2">
          <h3 className="font-serif text-base md:text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.nameEn}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground tamil-text line-clamp-1">
            {product.nameTa}
          </p>
          {/* Dynamic Star Rating */}
          <div className="mt-1">
            <StarRating
              rating={reviewStats.averageRating || 0}
              totalReviews={reviewStats.reviewCount}
              size="sm"
            />
          </div>
        </div>

        {/* Weight Dropdown */}
        {weightOptions.length > 1 && (
          <select
            value={selectedWeightIdx}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedWeightIdx(Number(e.target.value));
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full mb-2 px-2 py-1.5 rounded-md border border-border bg-background text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {weightOptions.map((w, i) => (
              <option key={i} value={i}>
                {w.weight} — ₹{w.price}
              </option>
            ))}
          </select>
        )}

        {/* Price */}
        <p className="mb-3 md:mb-4 text-lg md:text-xl font-bold text-primary">
          ₹{currentPrice}
          <span className="ml-1 text-xs md:text-sm font-normal text-muted-foreground">
            / {currentWeight.weight}
          </span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full gap-1.5 md:gap-2 h-9 md:h-10 text-xs md:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onReadMore(product);
            }}
          >
            <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>Read More</span>
            <span className="text-[10px] md:text-xs tamil-text hidden sm:inline">மேலும் படிக்க</span>
          </Button>

          <Button
            className={cn(
              "w-full gap-1.5 md:gap-2 h-9 md:h-10 text-xs md:text-sm transition-all",
              isAdding && "scale-95"
            )}
            onClick={handleQuickAdd}
            disabled={!isAvailable}
          >
            <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>Add to Cart</span>
            <span className="text-[10px] md:text-xs tamil-text hidden sm:inline">கார்ட்டில் சேர்</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;