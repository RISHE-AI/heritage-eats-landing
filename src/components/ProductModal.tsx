import React, { useState, useEffect, forwardRef } from "react";
import { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus, ShoppingCart, ChevronDown, ChevronUp, Star, MessageSquare } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import ProductReviews from "./ProductReviews";
import StarRating from "./StarRating";

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
  const { addToCart } = useCart();

  // Auto-slide carousel
  useEffect(() => {
    if (!product || !open) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [product, open]);

  // Reset state when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setQuantity(1);
    setSelectedWeight(null);
    setShowAllIngredients(false);
    setShowAllBenefits(false);
    setActiveTab("details");
  }, [product]);

  if (!product) return null;

  // Get weight options or default to single price
  const weightOptions = product.weightOptions || [
    { weight: "250", price: product.price, unit: "g" }
  ];

  const currentPrice = selectedWeight
    ? weightOptions.find(w => `${w.weight}${w.unit}` === selectedWeight)?.price || product.price
    : product.price;

  const handleAddToCart = () => {
    if (!selectedWeight) return;
    addToCart(product, quantity, selectedWeight, currentPrice);
    onClose();
  };

  // Limit items to show initially
  const ingredientsEnToShow = showAllIngredients ? product.ingredientsEn : product.ingredientsEn.slice(0, 3);
  const ingredientsTaToShow = showAllIngredients ? product.ingredientsTa : product.ingredientsTa.slice(0, 3);
  const benefitsEnToShow = showAllBenefits ? product.benefitsEn : product.benefitsEn.slice(0, 3);
  const benefitsTaToShow = showAllBenefits ? product.benefitsTa : product.benefitsTa.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.nameEn}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {/* Image Carousel */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary/30">
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
            {/* Dot indicators */}
            <div className="absolute bottom-3 md:bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    index === currentImageIndex
                      ? "bg-primary w-4"
                      : "bg-primary/40 hover:bg-primary/60"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {product.nameEn}
              </h2>
              <p className="mt-0.5 md:mt-1 text-base md:text-lg text-muted-foreground tamil-text">
                {product.nameTa}
              </p>
              {/* Star Rating Display */}
              <div className="mt-1.5 md:mt-2">
                <StarRating rating={4.5} totalReviews={12} size="md" />
              </div>
            </div>

            {/* Weight Selection */}
            <div className="mt-3 md:mt-4">
              <p className="font-medium text-sm md:text-base mb-2">Select Weight / எடையை தேர்ந்தெடு:</p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {weightOptions.map((option) => {
                  const weightKey = `${option.weight}${option.unit}`;
                  return (
                    <Button
                      key={weightKey}
                      variant={selectedWeight === weightKey ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedWeight(weightKey)}
                      className="min-w-[70px] md:min-w-[80px] h-9 md:h-10 text-xs md:text-sm"
                    >
                      {option.weight}{option.unit} - ₹{option.price}
                    </Button>
                  );
                })}
              </div>
            </div>

            <p className="mt-3 md:mt-4 text-2xl md:text-3xl font-bold text-primary">
              ₹{selectedWeight ? currentPrice : product.price}
              {!selectedWeight && <span className="text-xs md:text-sm font-normal text-muted-foreground ml-2">(select weight)</span>}
            </p>

            <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2">
              <p className="text-sm md:text-base text-foreground">{product.descriptionEn}</p>
              <p className="text-xs md:text-sm text-muted-foreground tamil-text">{product.descriptionTa}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mt-4 md:mt-6 flex items-center gap-3 md:gap-4">
              <span className="font-medium text-sm md:text-base">Quantity:</span>
              <div className="flex items-center bg-secondary rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 md:h-11 md:w-11 rounded-r-none"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 md:w-12 text-center text-base md:text-lg font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 md:h-11 md:w-11 rounded-l-none"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="mt-4 md:mt-6 gap-2 h-11 md:h-12 text-sm md:text-base"
              onClick={handleAddToCart}
              disabled={!selectedWeight}
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              <span>Add to Cart</span>
              <span className="tamil-text text-xs md:text-sm hidden sm:inline">கார்ட்டில் சேர்</span>
            </Button>
            {!selectedWeight && (
              <p className="text-xs md:text-sm text-destructive mt-2">Please select a weight option</p>
            )}
          </div>
        </div>

        {/* Tabs for Details and Reviews */}
        <div className="mt-6 md:mt-8 border-t pt-4 md:pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-10 md:h-11">
              <TabsTrigger value="details" className="gap-1.5 md:gap-2 text-xs md:text-sm">
                <Star className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5 md:gap-2 text-xs md:text-sm">
                <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4 md:mt-6 animate-fade-in">
              <h3 className="mb-4 md:mb-6 text-center font-serif text-lg md:text-xl font-bold">
                Ingredients & Benefits
              </h3>

              <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                {/* English Column */}
                <div className="space-y-3 md:space-y-4">
                  <div className="rounded-lg bg-secondary/50 p-3 md:p-4">
                    <h4 className="font-semibold text-foreground text-sm md:text-base">Ingredients</h4>
                    <ul className="mt-2 list-disc list-inside text-muted-foreground text-xs md:text-sm space-y-0.5">
                      {ingredientsEnToShow.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                    {product.ingredientsEn.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-xs md:text-sm"
                        onClick={() => setShowAllIngredients(!showAllIngredients)}
                      >
                        {showAllIngredients ? (
                          <>Show Less <ChevronUp className="h-3 w-3 md:h-4 md:w-4 ml-1" /></>
                        ) : (
                          <>View More ({product.ingredientsEn.length - 3}) <ChevronDown className="h-3 w-3 md:h-4 md:w-4 ml-1" /></>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="rounded-lg bg-success/10 p-3 md:p-4">
                    <h4 className="font-semibold text-success text-sm md:text-base">Health Benefits</h4>
                    <ul className="mt-2 list-disc list-inside text-muted-foreground text-xs md:text-sm space-y-0.5">
                      {benefitsEnToShow.map((ben, i) => (
                        <li key={i}>{ben}</li>
                      ))}
                    </ul>
                    {product.benefitsEn.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-xs md:text-sm"
                        onClick={() => setShowAllBenefits(!showAllBenefits)}
                      >
                        {showAllBenefits ? (
                          <>Show Less <ChevronUp className="h-3 w-3 md:h-4 md:w-4 ml-1" /></>
                        ) : (
                          <>View More ({product.benefitsEn.length - 3}) <ChevronDown className="h-3 w-3 md:h-4 md:w-4 ml-1" /></>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="rounded-lg bg-gold/10 p-3 md:p-4">
                    <h4 className="font-semibold text-gold-foreground text-sm md:text-base">Storage & Shelf Life</h4>
                    <p className="mt-2 text-muted-foreground text-xs md:text-sm">{product.storageEn}</p>
                    <p className="mt-1 text-muted-foreground text-xs md:text-sm">
                      <strong>Shelf Life:</strong> {product.shelfLife}
                    </p>
                  </div>
                </div>

                {/* Tamil Column */}
                <div className="space-y-3 md:space-y-4 tamil-text">
                  <div className="rounded-lg bg-secondary/50 p-3 md:p-4">
                    <h4 className="font-semibold text-foreground text-sm md:text-base">பொருட்கள்</h4>
                    <ul className="mt-2 list-disc list-inside text-muted-foreground text-xs md:text-sm space-y-0.5">
                      {ingredientsTaToShow.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                    {product.ingredientsTa.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-xs md:text-sm"
                        onClick={() => setShowAllIngredients(!showAllIngredients)}
                      >
                        {showAllIngredients ? "குறைவாக காட்டு" : `மேலும் (${product.ingredientsTa.length - 3})`}
                      </Button>
                    )}
                  </div>
                  <div className="rounded-lg bg-success/10 p-3 md:p-4">
                    <h4 className="font-semibold text-success text-sm md:text-base">ஆரோக்கிய நன்மைகள்</h4>
                    <ul className="mt-2 list-disc list-inside text-muted-foreground text-xs md:text-sm space-y-0.5">
                      {benefitsTaToShow.map((ben, i) => (
                        <li key={i}>{ben}</li>
                      ))}
                    </ul>
                    {product.benefitsTa.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-xs md:text-sm"
                        onClick={() => setShowAllBenefits(!showAllBenefits)}
                      >
                        {showAllBenefits ? "குறைவாக காட்டு" : `மேலும் (${product.benefitsTa.length - 3})`}
                      </Button>
                    )}
                  </div>
                  <div className="rounded-lg bg-gold/10 p-3 md:p-4">
                    <h4 className="font-semibold text-gold-foreground text-sm md:text-base">சேமிப்பு & ஆயுள்</h4>
                    <p className="mt-2 text-muted-foreground text-xs md:text-sm">{product.storageTa}</p>
                    <p className="mt-1 text-muted-foreground text-xs md:text-sm">
                      <strong>ஆயுள்:</strong> {product.shelfLife}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-4 md:mt-6 animate-fade-in">
              <ProductReviews 
                productId={product.id} 
                productName={product.nameEn} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ProductModal.displayName = "ProductModal";

export default ProductModal;