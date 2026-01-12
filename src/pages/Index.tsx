import React, { useState } from "react";
import { Product } from "@/types/product";
import { getProductsByCategory } from "@/data/products";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import ProductModal from "@/components/ProductModal";
import FeedbackSection from "@/components/FeedbackSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sweets = getProductsByCategory("sweets");
  const snacks = getProductsByCategory("snacks");
  const pickles = getProductsByCategory("pickles");

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
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

        <FeedbackSection />
      </main>

      <Footer />
      <WhatsAppButton />

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
