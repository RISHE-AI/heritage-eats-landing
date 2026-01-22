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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.nameEn}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
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
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
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
              <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                {product.nameEn}
              </h2>
              <p className="mt-1 text-lg text-muted-foreground tamil-text">
                {product.nameTa}
              </p>
              {/* Star Rating Display */}
              <div className="mt-2">
                <StarRating rating={4.5} totalReviews={12} size="md" />
              </div>
            </div>

            {/* Weight Selection */}
            <div className="mt-4">
              <p className="font-medium mb-2">Select Weight / எடையை தேர்ந்தெடு:</p>
              <div className="flex flex-wrap gap-2">
                {weightOptions.map((option) => {
                  const weightKey = `${option.weight}${option.unit}`;
                  return (
                    <Button
                      key={weightKey}
                      variant={selectedWeight === weightKey ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedWeight(weightKey)}
                      className="min-w-[80px]"
                    >
                      {option.weight}{option.unit} - ₹{option.price}
                    </Button>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-primary">
              ₹{selectedWeight ? currentPrice : product.price}
              {!selectedWeight && <span className="text-sm font-normal text-muted-foreground ml-2">(select weight)</span>}
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-foreground">{product.descriptionEn}</p>
              <p className="text-muted-foreground tamil-text">{product.descriptionTa}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4">
              <span className="font-medium">Quantity / அளவு:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="mt-6 gap-2"
              onClick={handleAddToCart}
              disabled={!selectedWeight}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Cart</span>
              <span className="tamil-text text-sm">கார்ட்டில் சேர்</span>
            </Button>
            {!selectedWeight && (
              <p className="text-sm text-destructive mt-2">Please select a weight option / எடை விருப்பத்தை தேர்ந்தெடுக்கவும்</p>
            )}
          </div>
        </div>

        {/* Tabs for Details and Reviews */}
        <div className="mt-8 border-t pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="gap-2">
                <Star className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6 animate-fade-in">
              <h3 className="mb-6 text-center font-serif text-xl font-bold">
                Ingredients & Benefits / பொருட்கள் & நன்மைகள்
              </h3>

          <div className="grid gap-6 md:grid-cols-2">
            {/* English Column */}
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <h4 className="font-semibold text-foreground">Ingredients</h4>
                <ul className="mt-2 list-disc list-inside text-muted-foreground">
                  {ingredientsEnToShow.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
                {product.ingredientsEn.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 p-0 h-auto"
                    onClick={() => setShowAllIngredients(!showAllIngredients)}
                  >
                    {showAllIngredients ? (
                      <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>View More ({product.ingredientsEn.length - 3} more) <ChevronDown className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
              <div className="rounded-lg bg-success/10 p-4">
                <h4 className="font-semibold text-success">Health Benefits</h4>
                <ul className="mt-2 list-disc list-inside text-muted-foreground">
                  {benefitsEnToShow.map((ben, i) => (
                    <li key={i}>{ben}</li>
                  ))}
                </ul>
                {product.benefitsEn.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 p-0 h-auto"
                    onClick={() => setShowAllBenefits(!showAllBenefits)}
                  >
                    {showAllBenefits ? (
                      <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>View More ({product.benefitsEn.length - 3} more) <ChevronDown className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
              <div className="rounded-lg bg-gold/10 p-4">
                <h4 className="font-semibold text-gold-foreground">Storage & Shelf Life</h4>
                <p className="mt-2 text-muted-foreground">{product.storageEn}</p>
                <p className="mt-1 text-muted-foreground">
                  <strong>Shelf Life:</strong> {product.shelfLife}
                </p>
              </div>
            </div>

            {/* Tamil Column */}
            <div className="space-y-4 tamil-text">
              <div className="rounded-lg bg-secondary/50 p-4">
                <h4 className="font-semibold text-foreground">பொருட்கள்</h4>
                <ul className="mt-2 list-disc list-inside text-muted-foreground">
                  {ingredientsTaToShow.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
                {product.ingredientsTa.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 p-0 h-auto"
                    onClick={() => setShowAllIngredients(!showAllIngredients)}
                  >
                    {showAllIngredients ? "குறைவாக காட்டு" : `மேலும் (${product.ingredientsTa.length - 3})`}
                  </Button>
                )}
              </div>
              <div className="rounded-lg bg-success/10 p-4">
                <h4 className="font-semibold text-success">ஆரோக்கிய நன்மைகள்</h4>
                <ul className="mt-2 list-disc list-inside text-muted-foreground">
                  {benefitsTaToShow.map((ben, i) => (
                    <li key={i}>{ben}</li>
                  ))}
                </ul>
                {product.benefitsTa.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 p-0 h-auto"
                    onClick={() => setShowAllBenefits(!showAllBenefits)}
                  >
                    {showAllBenefits ? "குறைவாக காட்டு" : `மேலும் (${product.benefitsTa.length - 3})`}
                  </Button>
                )}
              </div>
              <div className="rounded-lg bg-gold/10 p-4">
                <h4 className="font-semibold text-gold-foreground">சேமிப்பு & ஆயுள்</h4>
                <p className="mt-2 text-muted-foreground">{product.storageTa}</p>
                <p className="mt-1 text-muted-foreground">
                  <strong>ஆயுள்:</strong> {product.shelfLife}
                </p>
              </div>
            </div>
          </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6 animate-fade-in">
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
