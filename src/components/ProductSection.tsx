import React from "react";
import { Product } from "@/types/product";
import ProductGrid from "./ProductGrid";

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
  return (
    <section id={id} className="py-8 md:py-12 lg:py-16">
      <div className="container px-3 md:px-6 lg:px-8">
        <div className="mb-6 md:mb-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            {titleEn}
          </h2>
          <p className="mt-1.5 md:mt-2 text-lg md:text-xl text-muted-foreground tamil-text">
            {titleTa}
          </p>
          <div className="mx-auto mt-3 md:mt-4 h-1 w-20 md:w-24 rounded-full bg-gradient-to-r from-primary via-gold to-primary" />
        </div>
        <ProductGrid products={products} onProductClick={onProductClick} />
      </div>
    </section>
  );
};

export default ProductSection;