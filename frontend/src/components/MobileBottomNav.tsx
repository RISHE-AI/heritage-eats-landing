import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Heart, ShoppingCart, User, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

const NAV_ITEMS = [
    { icon: Home, label: "Home", path: "/", scrollTo: null, action: null },
    { icon: ShoppingBag, label: "Shop", path: "/", scrollTo: "#best-sellers", action: null },
    { icon: Heart, label: "Wishlist", path: null, scrollTo: null, action: "wishlist" as const },
    { icon: ShoppingCart, label: "Cart", path: "/checkout", scrollTo: null, action: null },
    { icon: User, label: "Profile", path: null, scrollTo: null, action: "profile" as const },
];

const MobileBottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { totalItems: cartCount } = useCart();
    const { totalItems: wishlistCount, items: wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [wishlistOpen, setWishlistOpen] = useState(false);

    // Don't show on admin page
    if (location.pathname.startsWith("/admin")) return null;

    const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
        if (item.action === "wishlist") {
            setWishlistOpen(true);
            return;
        }
        if (item.action === "profile") {
            navigate(user ? "/profile" : "/auth");
            return;
        }
        if (item.path) {
            if (item.scrollTo && location.pathname === "/") {
                document.querySelector(item.scrollTo)?.scrollIntoView({ behavior: "smooth" });
            } else {
                navigate(item.path);
                if (item.scrollTo) {
                    setTimeout(() => {
                        document.querySelector(item.scrollTo!)?.scrollIntoView({ behavior: "smooth" });
                    }, 500);
                }
            }
        }
    };

    const isActive = (item: typeof NAV_ITEMS[0]) => {
        if (item.action === "profile") return location.pathname === "/profile" || location.pathname === "/auth";
        if (item.action === "wishlist") return wishlistOpen;
        if (item.path === "/checkout") return location.pathname === "/checkout";
        if (item.label === "Shop") return false;
        return location.pathname === item.path;
    };

    const handleAddToCartFromWishlist = (product: Product) => {
        const weight = product.weightOptions?.length ? product.weightOptions[0] : { weight: "250", price: product.price, unit: "g" };
        addToCart(product, 1, weight.weight, weight.price);
        removeFromWishlist(product.id);
    };

    return (
        <>
            <nav className="bottom-nav md:hidden" role="navigation" aria-label="Mobile navigation">
                <div className="flex items-center justify-around px-1">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item);
                        const Icon = item.icon;
                        const showBadge = item.action === "wishlist" ? wishlistCount > 0 : item.label === "Cart" ? cartCount > 0 : false;
                        const badgeCount = item.action === "wishlist" ? wishlistCount : cartCount;

                        return (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item)}
                                className={cn("bottom-nav-item", active && "active")}
                                aria-label={item.label}
                            >
                                <div className="relative">
                                    <Icon className={cn("h-5 w-5 transition-all duration-200", active && "scale-110")} />
                                    {showBadge && (
                                        <span className="absolute -top-1.5 -right-2 h-4 min-w-4 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1 cart-badge-animate">
                                            {badgeCount > 9 ? "9+" : badgeCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium leading-none mt-0.5">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Inline Wishlist Sheet */}
            <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
                <SheetContent side="right" className="w-80 p-0">
                    <SheetTitle className="sr-only">Wishlist</SheetTitle>
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-primary" />
                                <h2 className="font-serif font-bold text-base">Wishlist</h2>
                                {wishlistCount > 0 && (
                                    <span className="text-xs text-muted-foreground">({wishlistCount})</span>
                                )}
                            </div>
                        </div>

                        {wishlistItems.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-6 text-center">
                                <div>
                                    <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">Your wishlist is empty</p>
                                    <p className="text-xs text-muted-foreground/70 tamil-text mt-1">விருப்பப்பட்டியல் காலியாக உள்ளது</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {wishlistItems.map((product) => (
                                    <div key={product.id} className="flex gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/50">
                                        <img
                                            src={product.images[0]}
                                            alt={product.nameEn}
                                            className="h-16 w-16 rounded-lg object-cover bg-secondary shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{product.nameEn}</p>
                                            <p className="text-xs text-muted-foreground">₹{product.price}</p>
                                            <div className="flex gap-2 mt-1.5">
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-[10px] rounded-lg gap-1 flex-1"
                                                    onClick={() => handleAddToCartFromWishlist(product)}
                                                >
                                                    <ShoppingCart className="h-3 w-3" />
                                                    Add to Cart
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 w-7 p-0 text-destructive"
                                                    onClick={() => removeFromWishlist(product.id)}
                                                    aria-label="Remove from wishlist"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};

export default MobileBottomNav;
