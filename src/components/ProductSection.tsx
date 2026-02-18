import React from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  id: string;
  titleEn: string;
  titleTa: string;
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  id,
  titleEn,
  titleTa,
  products,
  onProductClick,
}) => {
  if (products.length === 0) return null;

  return (
    <section id={id} className="py-8 md:py-12 lg:py-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 md:mb-8 text-center">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            {titleEn}
          </h2>
          <p className="mt-1 text-sm md:text-base text-muted-foreground tamil-text">
            {titleTa}
          </p>
          <div className="mx-auto mt-3 h-0.5 w-16 md:w-20 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Mobile: Vertical List Layout (Amazon/Flipkart style) */}
        <div className="md:hidden space-y-2.5">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <ProductCard product={product} onReadMore={onProductClick} variant="list" />
            </div>
          ))}
        </div>

        {/* Tablet + Desktop: Grid Layout — 2 cols (tablet), 4 cols (desktop) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard product={product} onReadMore={onProductClick} variant="card" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;