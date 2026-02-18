import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, User, Search, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import WishlistSheet from "./WishlistSheet";
import { Product, transformProduct } from "@/types/product";
import { fetchProducts } from "@/services/api";

const NAV_LINKS = [
  { href: "#best-sellers", labelEn: "Best Sellers", labelTa: "சிறந்தவை" },
  { href: "#sweets", labelEn: "Sweets", labelTa: "இனிப்புகள்" },
  { href: "#snacks", labelEn: "Snacks", labelTa: "தின்பண்டங்கள்" },
  { href: "#pickles", labelEn: "Pickles", labelTa: "ஊறுகாய்" },
  { href: "#malts", labelEn: "Malts", labelTa: "மால்ட்" },
  { href: "#podi", labelEn: "Podi", labelTa: "பொடி" },
  { href: "#feedback", labelEn: "Reviews", labelTa: "மதிப்புரைகள்" },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Load products for search
  useEffect(() => {
    fetchProducts().then(res => {
      if (res.success && res.data) {
        setAllProducts(res.data.map((p: any) => transformProduct(p)));
      }
    }).catch(() => { });
  }, []);

  // Scroll detection for shadow + active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);

      // Detect active section
      if (location.pathname === "/") {
        const sections = NAV_LINKS.map(l => l.href.replace("#", ""));
        let current = "";
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 120) current = id;
          }
        }
        setActiveSection(current);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const term = searchQuery.toLowerCase();
    const results = allProducts.filter(p =>
      p.nameEn.toLowerCase().includes(term) ||
      p.nameTa.includes(searchQuery) ||
      p.category.toLowerCase().includes(term)
    ).slice(0, 6);
    setSearchResults(results);
  }, [searchQuery, allProducts]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSearchSelect = (product: Product) => {
    setSearchQuery("");
    setSearchOpen(false);
    const sectionId = `#${product.category}`;
    handleNavClick(sectionId);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 transition-shadow duration-300",
          scrolled && "header-scrolled"
        )}
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Maghizam Home">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <span className="text-lg md:text-xl">🍯</span>
              </div>
              <div className="leading-tight">
                <h1 className="font-serif text-sm md:text-base font-bold text-foreground tracking-tight">
                  Maghizam
                </h1>
                <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium -mt-0.5">
                  Homemade Delights
                </p>
              </div>
            </Link>

            {/* Desktop Nav — Categories with Tamil */}
            <nav className="hidden lg:flex items-center gap-0.5 bg-secondary/30 rounded-full px-1.5 py-1" aria-label="Product categories">
              {NAV_LINKS.slice(0, 6).map((link) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={cn(
                      "nav-link-underline px-3 py-1.5 text-center transition-all rounded-full",
                      isActive
                        ? "text-primary bg-primary/10 active"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                    aria-label={`${link.labelEn} - ${link.labelTa}`}
                  >
                    <span className="text-xs font-medium leading-tight block">{link.labelEn}</span>
                    <span className="text-[8px] text-muted-foreground/70 leading-tight block tamil-text">{link.labelTa}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="flex items-center gap-1 md:gap-1.5">
              {/* Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 transition-transform duration-200 hover:scale-110"
                onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                {searchOpen ? <X className="h-[1.15rem] w-[1.15rem]" /> : <Search className="h-[1.15rem] w-[1.15rem]" />}
              </Button>

              {/* Theme Toggle - Desktop */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Wishlist - Desktop */}
              <div className="hidden md:block">
                <WishlistSheet />
              </div>

              {/* Cart */}
              <Link to="/checkout" aria-label={`Cart with ${cartCount} items`}>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative transition-transform duration-200 hover:scale-110">
                  <ShoppingCart className="h-[1.15rem] w-[1.15rem]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1 cart-badge-animate">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Profile - Desktop */}
              <Link to={user ? "/profile" : "/auth"} className="hidden md:block" aria-label={user ? "Profile" : "Login"}>
                <Button variant="ghost" size="icon" className="h-9 w-9 transition-transform duration-200 hover:scale-110">
                  <User className="h-[1.15rem] w-[1.15rem]" />
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" aria-label="Open navigation menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="p-5 border-b bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                          <span className="text-xl">🍯</span>
                        </div>
                        <div>
                          <h2 className="font-serif font-bold text-base">Maghizam</h2>
                          <p className="text-xs text-muted-foreground">Homemade Delights</p>
                        </div>
                      </div>
                    </div>

                    {/* User Quick Card */}
                    <Link
                      to={user ? "/profile" : "/auth"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="mx-4 mt-4 p-3 rounded-xl bg-secondary/30 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
                      aria-label={user ? "View profile" : "Login or sign up"}
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user ? user.name : "Login / Sign Up"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {user ? user.phone : "Sign in to your account"}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>

                    {/* Category Navigation with Tamil */}
                    <div className="px-4 mt-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-2">
                        Categories
                      </p>
                    </div>
                    <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto" aria-label="Mobile categories">
                      {NAV_LINKS.map((link) => {
                        const isActive = activeSection === link.href.replace("#", "");
                        return (
                          <button
                            key={link.href}
                            onClick={() => handleNavClick(link.href)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                            <div className="flex flex-col items-start">
                              <span>{link.labelEn}</span>
                              <span className="text-[10px] text-muted-foreground/70 tamil-text -mt-0.5">{link.labelTa}</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                          </button>
                        );
                      })}
                    </nav>

                    {/* Mobile Footer */}
                    <div className="p-4 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Theme</span>
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Search Bar — Expandable below header */}
        {searchOpen && (
          <div className="border-t border-border/30 bg-background animate-fade-in">
            <div className="container mx-auto px-4 py-3">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products... / தேடு..."
                  autoFocus
                  className="pl-10 pr-10 h-10 rounded-xl border-primary/20 focus:border-primary input-glow"
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Results dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                    {searchResults.map((product, index) => (
                      <button
                        key={product.id}
                        onClick={() => handleSearchSelect(product)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/50 transition-colors",
                          index !== searchResults.length - 1 && "border-b border-border/50"
                        )}
                      >
                        <img
                          src={product.images[0]}
                          alt={product.nameEn}
                          className="h-10 w-10 rounded-lg object-cover bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.nameEn}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{product.category}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">₹{product.price}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg p-4 text-center z-50 animate-fade-in">
                    <p className="text-sm text-muted-foreground">No products found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;