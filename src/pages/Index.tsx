import React, { useState, useEffect } from "react";
import { Product, transformProduct } from "@/types/product";
import { fetchProducts } from "@/services/api";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import ProductModal from "@/components/ProductModal";
import FeedbackSection from "@/components/FeedbackSection";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import ScrollToTop from "@/components/ScrollToTop";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />

        {loading ? (
          <div className="container px-4 py-16 space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Loading products...</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="container px-4 py-16 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
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

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {malts.length > 0 && (
              <>
                <ProductSection
                  id="malts"
                  titleEn="Health Malts"
                  titleTa="ஆரோக்கிய மால்ட்"
                  products={malts}
                  onProductClick={handleProductClick}
                />
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </>
            )}

            {podi.length > 0 && (
              <>
                <ProductSection
                  id="podi"
                  titleEn="Traditional Podi"
                  titleTa="பாரம்பரிய பொடி"
                  products={podi}
                  onProductClick={handleProductClick}
                />
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </>
            )}
          </>
        )}

        {/* Recently Viewed Section */}
        <RecentlyViewedSection
          products={recentlyViewed}
          onProductClick={handleProductClick}
          onClear={clearRecentlyViewed}
        />

        <FeedbackSection />
      </main>

      <Footer />
      <ScrollToTop />
      <Chatbot />

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
