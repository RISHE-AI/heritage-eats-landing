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
    <section id={id} className="py-12 md:py-16">
      <div className="container px-4 md:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {titleEn}
          </h2>
          <p className="mt-2 text-xl text-muted-foreground tamil-text">
            {titleTa}
          </p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-gold to-primary" />
        </div>
        <ProductGrid products={products} onProductClick={onProductClick} />
      </div>
    </section>
  );
};

export default ProductSection;
