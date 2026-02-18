import React, { useState, useEffect, forwardRef } from "react";
import { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Minus, Plus, ShoppingCart, Star,
  MessageSquare, Clock, Shield,
  Leaf, Heart, Package
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import ProductReviews from "./ProductReviews";
import StarRating from "./StarRating";
import { fetchReviewStats } from "@/services/api";
import ImageCarousel from "./ImageCarousel";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductModal = forwardRef<HTMLDivElement, ProductModalProps>(({ product, open, onClose }, ref) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [customMessage, setCustomMessage] = useState("");
  const [reviewStats, setReviewStats] = useState({ reviewCount: 0, averageRating: 0 });
  const [showKeyboard, setShowKeyboard] = useState(false);
  const { addToCart } = useCart();

  // Reset state when product changes
  useEffect(() => {
    setQuantity(1);
    if (product) {
      const opts = product.weightOptions?.length
        ? product.weightOptions
        : [{ weight: "250", price: product.price, unit: "g" }];
      setSelectedWeight(opts[0].weight);
    } else {
      setSelectedWeight(null);
    }
    setShowAllIngredients(false);
    setShowAllBenefits(false);
    setActiveTab("details");
    setCustomMessage("");
    setReviewStats({ reviewCount: 0, averageRating: 0 });
  }, [product]);

  useEffect(() => {
    if (!product || !open) return;
    fetchReviewStats(product.id).then(res => {
      if (res.success) setReviewStats(res.data);
    }).catch(() => { });
  }, [product, open]);

  if (!product) return null;

  const weightOptions = product.weightOptions?.length
    ? product.weightOptions
    : [{ weight: "250", price: product.price, unit: "g" }];

  const currentPrice = selectedWeight
    ? weightOptions.find(w => w.weight === selectedWeight)?.price || product.price
    : product.price;

  const handleAddToCart = () => {
    if (!selectedWeight) return;
    addToCart(product, quantity, selectedWeight, currentPrice, customMessage.trim() || undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.nameEn}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-0 md:grid-cols-2">
          {/* ── Image Carousel ── */}
          <div className="bg-secondary/10 md:rounded-l-2xl flex flex-col justify-center overflow-hidden">
            <ImageCarousel
              images={product.images}
              productName={product.nameEn}
              aspectRatio="aspect-square"
              className="w-full h-full"
            />
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col p-5 md:p-6 gap-4">

            {/* Name + Rating */}
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {product.nameEn}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground tamil-text">{product.nameTa}</p>
              <div className="mt-2">
                <StarRating rating={reviewStats.averageRating || 0} totalReviews={reviewStats.reviewCount} size="md" />
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-secondary/30 px-3 py-2.5 space-y-1">
              <p className="text-sm text-foreground/90 leading-relaxed">{product.descriptionEn}</p>
              {product.descriptionTa && (
                <p className="text-xs text-muted-foreground/70 tamil-text">{product.descriptionTa}</p>
              )}
            </div>

            {/* Weight Selection */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Select Weight
              </p>
              <div className="flex flex-wrap gap-2">
                {weightOptions.map((option) => (
                  <button
                    key={option.weight}
                    onClick={() => setSelectedWeight(option.weight)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200",
                      selectedWeight === option.weight
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                        : "border-border bg-secondary/40 text-foreground hover:border-primary/50 hover:bg-secondary/70"
                    )}
                  >
                    {option.weight} · ₹{option.price}
                  </button>
                ))}
              </div>
            </div>

            {/* Price + Quantity */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-primary">₹{currentPrice * quantity}</span>
                {quantity > 1 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ₹{currentPrice} × {quantity}
                  </span>
                )}
              </div>
              <div className="flex items-center bg-secondary rounded-xl overflow-hidden border border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none hover:bg-secondary/80"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-9 text-center text-sm font-bold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-none hover:bg-secondary/80"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Custom Instructions
                  <span className="ml-1 font-normal normal-case">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all",
                    showKeyboard
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  ⌨ Keyboard
                </button>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. Less sugar, spicy, gift packing..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                rows={2}
                maxLength={200}
              />
            </div>
            

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full gap-2 h-12 text-sm font-semibold rounded-xl btn-lift ripple shadow-md"
              onClick={handleAddToCart}
              disabled={!selectedWeight}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart — ₹{currentPrice * quantity}
            </Button>

            {/* Info Strip */}
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 2–3 days</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 100% Fresh</span>
            </div>
          </div>
        </div>

        {/* Tabs: Details & Reviews */}
        <div className="border-t px-4 md:px-6 pt-5 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-10 rounded-xl">
              <TabsTrigger value="details" className="gap-1.5 text-xs rounded-xl">
                <Star className="h-3.5 w-3.5" /> Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5 text-xs rounded-xl">
                <MessageSquare className="h-3.5 w-3.5" /> Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 animate-fade-in space-y-3">

              {/* Ingredients Card */}
              {(product.ingredientsEn?.length > 0 && product.ingredientsEn[0]) && (
                <div className="rounded-2xl border border-emerald-200/40 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-200/40 dark:border-emerald-900/40">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <Leaf className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Ingredients</h4>
                      <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500 tamil-text">பொருட்கள்</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <ul className="space-y-1">
                        {(showAllIngredients ? product.ingredientsEn : product.ingredientsEn.slice(0, 5)).map((ing, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                      {product.ingredientsTa?.length > 0 && product.ingredientsTa[0] && (
                        <ul className="space-y-1 tamil-text">
                          {(showAllIngredients ? product.ingredientsTa : product.ingredientsTa.slice(0, 5)).map((ing, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                              {ing}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {product.ingredientsEn.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                        onClick={() => setShowAllIngredients(!showAllIngredients)}
                      >
                        {showAllIngredients ? "Show Less ↑" : `View All (${product.ingredientsEn.length}) ↓`}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Health Benefits Card */}
              {(product.benefitsEn?.length > 0 && product.benefitsEn[0]) && (
                <div className="rounded-2xl border border-rose-200/40 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-rose-200/40 dark:border-rose-900/40">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                      <Heart className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-300">Health Benefits</h4>
                      <p className="text-[10px] text-rose-600/70 dark:text-rose-500 tamil-text">நன்மைகள்</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <ul className="space-y-1">
                        {(showAllBenefits ? product.benefitsEn : product.benefitsEn.slice(0, 5)).map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                            <span className="mt-0.5 text-rose-500 text-[10px] font-bold shrink-0">✓</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                      {product.benefitsTa?.length > 0 && product.benefitsTa[0] && (
                        <ul className="space-y-1 tamil-text">
                          {(showAllBenefits ? product.benefitsTa : product.benefitsTa.slice(0, 5)).map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                              <span className="mt-0.5 text-rose-400 text-[10px] font-bold shrink-0">✓</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {product.benefitsEn.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700"
                        onClick={() => setShowAllBenefits(!showAllBenefits)}
                      >
                        {showAllBenefits ? "Show Less ↑" : `View All (${product.benefitsEn.length}) ↓`}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Shelf Life & Storage Card */}
              {(product.storageEn || product.shelfLife) && (
                <div className="rounded-2xl border border-amber-200/40 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200/40 dark:border-amber-900/40">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Shelf Life & Storage</h4>
                      <p className="text-[10px] text-amber-600/70 dark:text-amber-500 tamil-text">சேமிப்பு முறை</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    {product.shelfLife && (
                      <div className="mb-3 inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg px-3 py-1.5">
                        <Package className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                          Shelf Life: {product.shelfLife}
                        </span>
                      </div>
                    )}
                    <div className="grid gap-3 md:grid-cols-2">
                      {product.storageEn && (
                        <p className="text-xs text-foreground/80 leading-relaxed">{product.storageEn}</p>
                      )}
                      {product.storageTa && (
                        <p className="text-xs text-foreground/70 leading-relaxed tamil-text">{product.storageTa}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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