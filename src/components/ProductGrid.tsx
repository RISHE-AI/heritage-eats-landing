import React from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ProductCard product={product} onReadMore={onProductClick} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
