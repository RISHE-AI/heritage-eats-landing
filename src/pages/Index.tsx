import React, { useState, useEffect } from "react";
import { Product, transformProduct } from "@/types/product";
import { fetchProducts } from "@/services/api";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CountdownBanner from "@/components/CountdownBanner";
import SpecialOffers from "@/components/SpecialOffers";
import StatsCounter from "@/components/StatsCounter";
import ProductSection from "@/components/ProductSection";
import ProductModal from "@/components/ProductModal";
import GallerySection from "@/components/GallerySection";
import FeedbackSection from "@/components/FeedbackSection";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import ScrollToTop from "@/components/ScrollToTop";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Skeleton } from "@/components/ui/skeleton";

const Index: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchProducts();
        if (result.success && result.data) {
          const transformed = result.data.map(transformProduct);
          setProducts(transformed);
        }
      } catch (err: any) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const getByCategory = (category: string) =>
    products.filter(p => p.category === category && p.available !== false);

  const sweets = getByCategory("sweets");
  const snacks = getByCategory("snacks");
  const pickles = getByCategory("pickles");
  const malts = getByCategory("malts");
  const podi = getByCategory("podi");

  // Best sellers: top sold products
  const bestSellers = [...products]
    .filter(p => p.available !== false)
    .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
    .slice(0, 8);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
    addToRecentlyViewed(product);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <div className="min-h-screen bg-background page-enter pb-safe-bottom">
      <Header />
      <main>
        <Hero />
        <CountdownBanner />

        <SpecialOffers />
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <StatsCounter />
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {loading ? (
          <div className="container px-4 py-12 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm">Loading products...</span>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="container px-4 py-16 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium btn-lift"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Best Sellers */}
            {bestSellers.length > 0 && (
              <>
                <ProductSection
                  id="best-sellers"
                  titleEn="Best Sellers"
                  titleTa="சிறந்த விற்பனையாளர்கள்"
                  products={bestSellers}
                  onProductClick={handleProductClick}
                />
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </>
            )}

            <ProductSection
              id="sweets"
              titleEn="Sweets"
              titleTa="இனிப்புகள்"
              products={sweets}
              onProductClick={handleProductClick}
            />
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <ProductSection
              id="snacks"
              titleEn="Snacks"
              titleTa="தின்பண்டங்கள்"
              products={snacks}
              onProductClick={handleProductClick}
            />
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <ProductSection
              id="pickles"
              titleEn="Pickles & Thokku"
              titleTa="ஊறுகாய் & தொக்கு"
              products={pickles}
              onProductClick={handleProductClick}
            />

            {malts.length > 0 && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <ProductSection
                  id="malts"
                  titleEn="Health Malts"
                  titleTa="ஆரோக்கிய மால்ட்"
                  products={malts}
                  onProductClick={handleProductClick}
                />
              </>
            )}

            {podi.length > 0 && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <ProductSection
                  id="podi"
                  titleEn="Traditional Podi"
                  titleTa="பாரம்பரிய பொடி"
                  products={podi}
                  onProductClick={handleProductClick}
                />
              </>
            )}
          </>
        )}

        <RecentlyViewedSection
          products={recentlyViewed}
          onProductClick={handleProductClick}
          onClear={clearRecentlyViewed}
        />

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <GallerySection />

        <FeedbackSection />

      </main>

      <Footer />
      <ScrollToTop />
      <Chatbot />
      <MobileBottomNav />

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
