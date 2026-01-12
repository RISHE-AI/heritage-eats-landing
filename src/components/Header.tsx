import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "#sweets", labelEn: "Sweets", labelTa: "இனிப்புகள்" },
  { href: "#snacks", labelEn: "Snacks", labelTa: "தின்பண்டங்கள்" },
  { href: "#pickles", labelEn: "Pickles", labelTa: "ஊறுகாய்" },
  { href: "#feedback", labelEn: "Reviews", labelTa: "மதிப்புரைகள்" },
];

const Header: React.FC = () => {
  const { totalItems, cartAnimation } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (href: string) => {
    if (location.pathname !== "/") {
      window.location.href = "/" + href;
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-start">
          <span className="font-serif text-xl font-bold text-primary md:text-2xl">
            Homemade Delights
          </span>
          <span className="text-xs text-muted-foreground tamil-text">
            வீட்டு சமையல் சுவைகள்
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="group flex flex-col items-center transition-colors hover:text-primary"
            >
              <span className="text-sm font-medium">{link.labelEn}</span>
              <span className="text-xs text-muted-foreground tamil-text">{link.labelTa}</span>
            </button>
          ))}
        </nav>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center gap-2">
          <Link to="/checkout">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span
                  className={cn(
                    "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground",
                    cartAnimation && "cart-badge-animate"
                  )}
                >
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map(link => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="flex flex-col items-start p-3 rounded-lg transition-colors hover:bg-secondary"
                  >
                    <span className="font-medium">{link.labelEn}</span>
                    <span className="text-sm text-muted-foreground tamil-text">{link.labelTa}</span>
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
