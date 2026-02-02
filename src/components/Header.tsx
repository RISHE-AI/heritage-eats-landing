import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import AboutModal from "@/components/AboutModal";
import ProductSearch from "@/components/ProductSearch";
import WishlistSheet from "@/components/WishlistSheet";
import ProductModal from "@/components/ProductModal";
import { Product } from "@/types/product";

const navLinks = [
  { href: "#sweets", labelEn: "Sweets", labelTa: "இனிப்புகள்" },
  { href: "#snacks", labelEn: "Snacks", labelTa: "தின்பண்டங்கள்" },
  { href: "#pickles", labelEn: "Pickles", labelTa: "ஊறுகாய்" },
  { href: "#malts", labelEn: "Malts", labelTa: "மால்ட்" },
  { href: "#podi", labelEn: "Podi", labelTa: "பொடி" },
  { href: "#feedback", labelEn: "Reviews", labelTa: "மதிப்புரைகள்" },
  { href: "/track-order", labelEn: "Track Order", labelTa: "ஆர்டர் கண்காணி", isLink: true },
];

const Header: React.FC = () => {
  const { totalItems, cartAnimation } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNavClick = (href: string, isLink?: boolean) => {
    if (isLink) {
      setMobileMenuOpen(false);
      return;
    }
    if (location.pathname !== "/") {
      window.location.href = "/" + href;
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-start">
            <span className="font-serif text-lg md:text-xl lg:text-2xl font-bold text-primary">
              Homemade Delights
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground tamil-text hidden sm:block">
              வீட்டு சமையல் சுவைகள்
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-4">
            {navLinks.map(link => 
              (link as any).isLink ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group flex flex-col items-center transition-all hover:text-primary hover:scale-105"
                >
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    {link.labelEn}
                  </span>
                  <span className="text-xs text-muted-foreground tamil-text group-hover:text-primary/70">{link.labelTa}</span>
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="group flex flex-col items-center transition-all hover:text-primary hover:scale-105"
                >
                  <span className="text-sm font-medium">{link.labelEn}</span>
                  <span className="text-xs text-muted-foreground tamil-text group-hover:text-primary/70">{link.labelTa}</span>
                </button>
              )
            )}
            <AboutModal />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5 md:gap-1.5">
            <ProductSearch onProductSelect={handleProductSelect} />
            
            <ThemeToggle />
            
            <WishlistSheet onProductClick={handleProductSelect} />
            
            <Link to={user ? "/profile" : "/auth"}>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/checkout">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs text-primary-foreground font-semibold",
                      cartAnimation && "cart-badge-animate"
                    )}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-4">
                <nav className="flex flex-col gap-1 mt-6">
                  {navLinks.map(link => 
                    (link as any).isLink ? (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex flex-col items-start p-3 rounded-lg transition-colors hover:bg-secondary active:scale-[0.98]"
                      >
                        <span className="font-medium text-sm flex items-center gap-1.5">
                          <Package className="h-4 w-4" />
                          {link.labelEn}
                        </span>
                        <span className="text-xs text-muted-foreground tamil-text">{link.labelTa}</span>
                      </Link>
                    ) : (
                      <button
                        key={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className="flex flex-col items-start p-3 rounded-lg transition-colors hover:bg-secondary active:scale-[0.98]"
                      >
                        <span className="font-medium text-sm">{link.labelEn}</span>
                        <span className="text-xs text-muted-foreground tamil-text">{link.labelTa}</span>
                      </button>
                    )
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <AboutModal 
                      trigger={
                        <button className="w-full flex flex-col items-start p-3 rounded-lg transition-colors hover:bg-secondary">
                          <span className="font-medium text-sm">About Us</span>
                          <span className="text-xs text-muted-foreground tamil-text">எங்களை பற்றி</span>
                        </button>
                      }
                    />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Product Modal for search/wishlist selections */}
      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setTimeout(() => setSelectedProduct(null), 300);
        }}
      />
    </>
  );
};

export default Header;