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
  variant?: "card" | "list";
}

const BADGE_STYLES: Record<string, { bg: string; text: string; animation: string }> = {
  new: { bg: 'bg-emerald-500', text: 'New', animation: 'animate-pulse' },
  hot: { bg: 'bg-red-500', text: '🔥 Hot', animation: '' },
  'top-seller': { bg: 'bg-amber-500', text: '⭐ Top Seller', animation: '' },
  limited: { bg: 'bg-purple-500', text: 'Limited', animation: 'animate-pulse' },
  custom: { bg: 'bg-blue-500', text: 'Special', animation: '' },
};

const BACKEND_BASE = 'https://heritage-eats-landing-1.onrender.com';

function resolveImage(img: string | undefined): string {
  if (!img || img === '/placeholder.svg') return '/placeholder.svg';
  if (img.startsWith('http') || img.startsWith('/images/') || img.startsWith('/placeholder')) return img;
  return `${BACKEND_BASE}/${img.replace(/^\//, '')}`;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onReadMore, variant = "card" }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [reviewStats, setReviewStats] = useState({ reviewCount: 0, averageRating: 0 });
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const inWishlist = isInWishlist(product.id);

  // Get the valid images list
  const validImages = (product.images || []).filter(
    img => img && typeof img === 'string' && img.trim() !== '' && img.trim() !== '/placeholder.svg'
  );
  const cardImageSrc = resolveImage(validImages[imageIndex]);

  // When an image fails to load, try the next one in the array
  const handleCardImageError = () => {
    if (imageIndex < validImages.length - 1) {
      setImageIndex(prev => prev + 1);
    }
    // If all images failed, the src will resolve to /placeholder.svg
  };

  const weightOptions = product.weightOptions?.length ? product.weightOptions : [
    { weight: "250", price: product.price, unit: "g" }
  ];
  const currentWeight = weightOptions[selectedWeightIdx];
  const currentPrice = currentWeight.price;

  useEffect(() => {
    fetchReviewStats(product.id).then(res => {
      if (res.success) setReviewStats(res.data);
    }).catch(() => { });
  }, [product.id]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1, currentWeight.weight, currentPrice);
    setTimeout(() => setIsAdding(false), 400);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnim(true);
    toggleWishlist(product);
    setTimeout(() => setHeartAnim(false), 500);
  };

  const isAvailable = product.available !== false;
  const badge = product.badge && BADGE_STYLES[product.badge];

  // ===== LIST VARIANT (Amazon/Flipkart style) =====
  if (variant === "list") {
    return (
      <div
        className={cn(
          "flex gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:border-primary/20 active:scale-[0.99]",
          !isAvailable && "opacity-60"
        )}
        onClick={() => onReadMore(product)}
      >
        {/* Image */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-secondary/20 shrink-0">
          <img
            src={cardImageSrc}
            alt={product.nameEn}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={handleCardImageError}
          />
          {badge && (
            <span className={cn(
              "absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-white text-[8px] font-bold",
              badge.bg, badge.animation
            )}>
              {badge.text}
            </span>
          )}
          {!isAvailable && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-destructive">Unavailable</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.nameEn}</h3>
            <p className="text-[10px] text-muted-foreground/70 tamil-text line-clamp-1">{product.nameTa}</p>
            {reviewStats.averageRating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-amber-500 text-[10px]">★</span>
                <span className="text-[10px] font-medium">{reviewStats.averageRating.toFixed(1)}</span>
                <span className="text-[9px] text-muted-foreground">({reviewStats.reviewCount})</span>
              </div>
            )}
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <span className="text-base font-bold text-primary">₹{currentPrice}</span>
              <span className="ml-1 text-[10px] text-muted-foreground">
                {currentWeight.weight}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleWishlistToggle}
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                  "bg-secondary/50 hover:bg-secondary active:scale-90",
                  inWishlist ? "text-destructive" : "text-muted-foreground"
                )}
              >
                <Heart className={cn(
                  "h-3.5 w-3.5",
                  inWishlist && "fill-current",
                  heartAnim && "heart-pop"
                )} />
              </button>
              <Button
                size="sm"
                className={cn(
                  "h-7 px-3 text-[11px] rounded-lg gap-1",
                  isAdding && "cart-shake"
                )}
                onClick={handleQuickAdd}
                disabled={!isAvailable}
              >
                <ShoppingCart className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== CARD VARIANT (Default) =====
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl shadow-card cursor-pointer transition-all duration-300 group",
        "hover:shadow-hover hover:-translate-y-1",
        !isAvailable && "opacity-60"
      )}
      onClick={() => onReadMore(product)}
    >
      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden bg-secondary/20 relative shine-effect">
        <img
          src={cardImageSrc}
          alt={product.nameEn}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
          onError={handleCardImageError}
        />

        {/* Badge */}
        {badge && (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-white text-[10px] md:text-xs font-bold shadow-lg z-10",
              badge.bg, badge.animation
            )}
          >
            {badge.text}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-2.5 right-2.5 h-8 w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center z-10",
            "bg-background/80 backdrop-blur-sm shadow-md transition-all duration-200",
            "hover:scale-110 hover:bg-background active:scale-95",
            inWishlist ? "text-destructive" : "text-muted-foreground hover:text-destructive"
          )}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn(
            "h-4 w-4 md:h-[18px] md:w-[18px] transition-transform",
            inWishlist && "fill-current",
            heartAnim && "heart-pop"
          )} />
        </button>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg rounded-full gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onReadMore(product);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </Button>
        </div>

        {/* Unavailable Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Unavailable
            </span>
          </div>
        )}

        {/* Rating Badge */}
        {reviewStats.averageRating > 0 && (
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
            <span className="text-amber-500 text-xs">★</span>
            <span className="text-xs font-semibold text-foreground">{reviewStats.averageRating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({reviewStats.reviewCount})</span>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3 md:p-4">
        {/* Name */}
        <div className="mb-2">
          <h3 className="font-serif text-sm md:text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.nameEn}
          </h3>
          <p className="text-[11px] md:text-xs text-muted-foreground/70 tamil-text line-clamp-1">
            {product.nameTa}
          </p>
        </div>

        {/* Weight Selector */}
        {weightOptions.length > 1 && (
          <select
            value={selectedWeightIdx}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedWeightIdx(Number(e.target.value));
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full mb-2 px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 input-glow transition-all"
          >
            {weightOptions.map((w, i) => (
              <option key={i} value={i}>
                {w.weight} — ₹{w.price}
              </option>
            ))}
          </select>
        )}

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg md:text-xl font-bold text-primary">₹{currentPrice}</span>
          <span className="ml-1.5 text-[11px] md:text-xs text-muted-foreground font-medium">
            {currentWeight.weight} pack
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          className={cn(
            "w-full gap-1.5 h-9 md:h-10 text-xs md:text-sm rounded-xl btn-lift ripple",
            isAdding && "cart-shake"
          )}
          onClick={handleQuickAdd}
          disabled={!isAvailable}
        >
          <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>Add to Cart</span>
          <span className="text-[10px] tamil-text hidden sm:inline opacity-80">கார்ட்டில் சேர்</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;