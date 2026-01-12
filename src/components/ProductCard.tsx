import React from "react";
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onReadMore: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onReadMore }) => {
  return (
    <Card className="overflow-hidden product-card-hover shadow-card">
      <div className="aspect-square overflow-hidden bg-secondary/30">
        <img
          src={product.images[0]}
          alt={product.nameEn}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4">
        {/* Product Name */}
        <div className="mb-2">
          <h3 className="font-serif text-lg font-semibold text-foreground">
            {product.nameEn}
          </h3>
          <p className="text-sm text-muted-foreground tamil-text">
            {product.nameTa}
          </p>
        </div>

        {/* Price */}
        <p className="mb-4 text-xl font-bold text-primary">
          ₹{product.price}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            / {product.category === 'pickles' ? '200g' : '250g'}
          </span>
        </p>

        {/* Read More Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onReadMore(product)}
        >
          <span>Read More</span>
          <span className="ml-2 text-xs tamil-text">மேலும் படிக்க</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
