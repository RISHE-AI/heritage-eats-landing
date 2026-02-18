import React, { useState, useEffect, forwardRef, useRef, TouchEvent } from "react";
import { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Minus, Plus, ShoppingCart, ChevronDown, ChevronUp, Star,
  MessageSquare, Truck, Clock, Shield, ChevronLeft, ChevronRight
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import ProductReviews from "./ProductReviews";
import StarRating from "./StarRating";
import { fetchReviewStats } from "@/services/api";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductModal = forwardRef<HTMLDivElement, ProductModalProps>(({ product, open, onClose }, ref) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [customMessage, setCustomMessage] = useState("");
  const [reviewStats, setReviewStats] = useState({ reviewCount: 0, averageRating: 0 });
  const [openAccordion, setOpenAccordion] = useState<string | null>("ingredients");
  const { addToCart } = useCart();

  // Touch swipe state
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);

  // Auto-slide carousel
  useEffect(() => {
    if (!product || !open) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % product.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [product, open]);

  // Reset state — set default weight to first option
  useEffect(() => {
    setCurrentImageIndex(0);
    setQuantity(1);
    if (product) {
      const opts = product.weightOptions?.length ? product.weightOptions : [{ weight: "250", price: product.price, unit: "g" }];
      setSelectedWeight(opts[0].weight);
    } else {
      setSelectedWeight(null);
    }
    setShowAllIngredients(false);
    setShowAllBenefits(false);
    setActiveTab("details");
    setCustomMessage("");
    setReviewStats({ reviewCount: 0, averageRating: 0 });
    setOpenAccordion("ingredients");
  }, [product]);

  useEffect(() => {
    if (!product || !open) return;
    fetchReviewStats(product.id).then(res => {
      if (res.success) setReviewStats(res.data);
    }).catch(() => { });
  }, [product, open]);

  if (!product) return null;

  const weightOptions = product.weightOptions || [{ weight: "250", price: product.price, unit: "g" }];
  const currentPrice = selectedWeight
    ? weightOptions.find(w => w.weight === selectedWeight)?.price || product.price
    : product.price;

  const handleAddToCart = () => {
    if (!selectedWeight) return;
    addToCart(product, quantity, selectedWeight, currentPrice, customMessage.trim() || undefined);
    onClose();
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: TouchEvent) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: TouchEvent) => { touchEnd.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentImageIndex(p => (p + 1) % product.images.length);
      else setCurrentImageIndex(p => (p - 1 + product.images.length) % product.images.length);
    }
  };

  const ingredientsEnToShow = showAllIngredients ? product.ingredientsEn : product.ingredientsEn.slice(0, 4);
  const ingredientsTaToShow = showAllIngredients ? product.ingredientsTa : product.ingredientsTa.slice(0, 4);
  const benefitsEnToShow = showAllBenefits ? product.benefitsEn : product.benefitsEn.slice(0, 4);
  const benefitsTaToShow = showAllBenefits ? product.benefitsTa : product.benefitsTa.slice(0, 4);

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => prev === key ? null : key);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.nameEn}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Image Gallery */}
          <div
            className="relative aspect-square overflow-hidden bg-secondary/20 md:rounded-l-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.nameEn} - Image ${index + 1}`}
                  className="h-full w-full flex-shrink-0 object-cover"
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(p => (p - 1 + product.images.length) % product.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(p => (p + 1) % product.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentImageIndex ? "bg-white w-5 shadow-md" : "bg-white/50 w-2 hover:bg-white/70"
                  )}
                />
              ))}
            </div>

            {/* Image counter */}
            <span className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
              {currentImageIndex + 1}/{product.images.length}
            </span>
          </div>

          {/* Product Info */}
          <div className="flex flex-col p-4 md:p-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">{product.nameEn}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground tamil-text">{product.nameTa}</p>
              <div className="mt-1.5">
                <StarRating rating={reviewStats.averageRating || 0} totalReviews={reviewStats.reviewCount} size="md" />
              </div>
            </div>

            {/* Description */}
            <div className="mt-3 space-y-1">
              <p className="text-sm text-foreground/90 leading-relaxed">{product.descriptionEn}</p>
              <p className="text-xs text-muted-foreground/70 tamil-text">{product.descriptionTa}</p>
            </div>

            {/* Weight Selection */}
            <div className="mt-4">
              <p className="font-medium text-sm mb-2">Select Weight:</p>
              <div className="flex flex-wrap gap-2">
                {weightOptions.map((option) => (
                  <Button
                    key={option.weight}
                    variant={selectedWeight === option.weight ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedWeight(option.weight)}
                    className={cn(
                      "min-w-[72px] h-9 text-xs rounded-xl transition-all",
                      selectedWeight === option.weight && "shadow-md"
                    )}
                  >
                    {option.weight}{option.unit || 'g'} · ₹{option.price}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">₹{currentPrice * quantity}</span>
              {quantity > 1 && <span className="text-xs text-muted-foreground">(₹{currentPrice} × {quantity})</span>}
            </div>

            {/* Quantity */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium">Qty:</span>
              <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-9 text-center text-sm font-semibold">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => setQuantity(q => q + 1)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="mt-3">
              <label className="text-xs font-medium text-muted-foreground">Custom Instructions (Optional):</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. Less sugar, spicy, gift packing..."
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 input-glow resize-none transition-all"
                rows={2}
                maxLength={200}
              />
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="mt-4 gap-2 h-11 text-sm rounded-xl btn-lift ripple"
              onClick={handleAddToCart}
              disabled={!selectedWeight}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart — ₹{currentPrice * quantity}
            </Button>

            {/* Delivery Info Strip */}
            <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Free delivery ₹500+</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 2-3 days</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 100% Fresh</span>
            </div>
          </div>
        </div>

        {/* Tabs: Details & Reviews */}
        <div className="border-t px-4 md:px-6 pt-4 pb-4 md:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-10 rounded-xl">
              <TabsTrigger value="details" className="gap-1.5 text-xs rounded-xl">
                <Star className="h-3.5 w-3.5" /> Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5 text-xs rounded-xl">
                <MessageSquare className="h-3.5 w-3.5" /> Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 animate-fade-in space-y-2">
              {/* Accordion: Ingredients */}
              <div className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleAccordion("ingredients")}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-secondary/30 transition-colors"
                >
                  <span>🌾 Ingredients / பொருட்கள்</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openAccordion === "ingredients" && "rotate-180")} />
                </button>
                {openAccordion === "ingredients" && (
                  <div className="px-4 pb-3 animate-fade-in">
                    <div className="grid gap-3 md:grid-cols-2">
                      <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
                        {ingredientsEnToShow.map((ing, i) => <li key={i}>{ing}</li>)}
                      </ul>
                      <ul className="list-disc list-inside text-muted-foreground text-xs tamil-text space-y-0.5">
                        {ingredientsTaToShow.map((ing, i) => <li key={i}>{ing}</li>)}
                      </ul>
                    </div>
                    {product.ingredientsEn.length > 4 && (
                      <Button variant="ghost" size="sm" className="mt-1 p-0 h-auto text-xs" onClick={() => setShowAllIngredients(!showAllIngredients)}>
                        {showAllIngredients ? "Show Less" : `View All (${product.ingredientsEn.length})`}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion: Benefits */}
              <div className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleAccordion("benefits")}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-secondary/30 transition-colors"
                >
                  <span>💚 Health Benefits / நன்மைகள்</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openAccordion === "benefits" && "rotate-180")} />
                </button>
                {openAccordion === "benefits" && (
                  <div className="px-4 pb-3 animate-fade-in">
                    <div className="grid gap-3 md:grid-cols-2">
                      <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
                        {benefitsEnToShow.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                      <ul className="list-disc list-inside text-muted-foreground text-xs tamil-text space-y-0.5">
                        {benefitsTaToShow.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                    {product.benefitsEn.length > 4 && (
                      <Button variant="ghost" size="sm" className="mt-1 p-0 h-auto text-xs" onClick={() => setShowAllBenefits(!showAllBenefits)}>
                        {showAllBenefits ? "Show Less" : `View All (${product.benefitsEn.length})`}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion: Storage */}
              <div className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleAccordion("storage")}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-secondary/30 transition-colors"
                >
                  <span>📦 Storage & Shelf Life / சேமிப்பு</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openAccordion === "storage" && "rotate-180")} />
                </button>
                {openAccordion === "storage" && (
                  <div className="px-4 pb-3 animate-fade-in grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{product.storageEn}</p>
                      <p className="text-xs text-muted-foreground mt-1"><strong>Shelf Life:</strong> {product.shelfLife}</p>
                    </div>
                    <div className="tamil-text">
                      <p className="text-xs text-muted-foreground">{product.storageTa}</p>
                      <p className="text-xs text-muted-foreground mt-1"><strong>ஆயுள்:</strong> {product.shelfLife}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4 animate-fade-in">
              <ProductReviews productId={product.id} productName={product.nameEn} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ProductModal.displayName = "ProductModal";

export default ProductModal;