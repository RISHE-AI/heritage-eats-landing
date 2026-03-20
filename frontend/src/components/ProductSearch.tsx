import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product, transformProduct } from "@/types/product";
import { fetchProducts } from "@/services/api";
import { cn } from "@/lib/utils";

interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onProductSelect }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchProducts();
        if (result.success && result.data) {
          setAllProducts(result.data.map((p: any) => transformProduct(p)));
        }
      } catch (error) {
        console.error('Failed to load products for search:', error);
      }
    };
    loadProducts();
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return allProducts.filter(product =>
      product.nameEn.toLowerCase().includes(searchTerm) ||
      product.nameTa.includes(query) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.descriptionEn.toLowerCase().includes(searchTerm)
    ).slice(0, 6);
  }, [query, allProducts]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (product: Product) => {
    onProductSelect(product);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Collapsed search button */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="h-9 w-9"
        >
          <Search className="h-5 w-5" />
        </Button>
      )}

      {/* Expanded search */}
      {isOpen && (
        <div className={cn(
          "absolute right-0 top-0 z-50 w-72 md:w-96",
          "animate-in fade-in-0 zoom-in-95"
        )}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search products... (⌘K)"
              className="pl-10 pr-10 h-11 bg-background border-2 border-primary/20 focus:border-primary"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Results */}
          {isFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-top-2">
              {searchResults.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left hover:bg-secondary transition-colors",
                    index !== searchResults.length - 1 && "border-b"
                  )}
                >
                  <img
                    src={product.images[0]}
                    alt={product.nameEn}
                    className="h-12 w-12 rounded-lg object-cover bg-secondary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.nameEn}</p>
                    <p className="text-sm text-muted-foreground tamil-text truncate">{product.nameTa}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">₹{product.price}</span>
                </button>
              ))}
            </div>
          )}

          {isFocused && query && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg p-6 text-center animate-in slide-in-from-top-2">
              <p className="text-muted-foreground">No products found for "{query}"</p>
              <p className="text-sm text-muted-foreground tamil-text mt-1">எந்த தயாரிப்புகளும் கிடைக்கவில்லை</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
