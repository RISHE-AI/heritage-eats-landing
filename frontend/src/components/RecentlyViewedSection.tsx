import React from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface RecentlyViewedSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onClear: () => void;
}

const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  products,
  onProductClick,
  onClear
}) => {
  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-serif text-xl font-semibold">Recently Viewed</h2>
              <p className="text-sm text-muted-foreground tamil-text">சமீபத்தில் பார்த்தவை</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => onProductClick(product)}
              className={cn(
                "flex-shrink-0 w-40 group",
                "bg-card rounded-lg overflow-hidden shadow-sm",
                "hover:shadow-md transition-all hover:scale-105"
              )}
            >
              <div className="aspect-square overflow-hidden bg-secondary/30">
                <img
                  src={product.images[0]}
                  alt={product.nameEn}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{product.nameEn}</p>
                <p className="text-xs text-muted-foreground tamil-text truncate">{product.nameTa}</p>
                <p className="text-sm font-bold text-primary mt-1">₹{product.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedSection;
