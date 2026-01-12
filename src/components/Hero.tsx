import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const Hero: React.FC = () => {
  const scrollToProducts = () => {
    document.querySelector("#sweets")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* English Content */}
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in">
            Traditional Homemade
            <span className="block text-primary">Snacks & Sweets</span>
          </h1>
          
          {/* Tamil Content */}
          <h2 className="mt-4 font-serif text-2xl font-semibold text-muted-foreground md:text-3xl animate-fade-in tamil-text">
            பாரம்பரிய வீட்டு தின்பண்டங்கள்
            <span className="block text-primary/80">மற்றும் இனிப்புகள்</span>
          </h2>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in">
            Made with love, tradition, and the finest ingredients.
            <br />
            Experience the authentic taste of homemade goodness.
          </p>
          
          <p className="mt-2 text-base text-muted-foreground tamil-text animate-fade-in">
            அன்பு, பாரம்பரியம் மற்றும் சிறந்த பொருட்களுடன் தயாரிக்கப்படுகிறது.
            <br />
            வீட்டு சமையலின் உண்மையான சுவையை அனுபவியுங்கள்.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in">
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="gap-2 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <span>Explore Products</span>
              <span className="tamil-text text-sm">தயாரிப்புகளை காண்க</span>
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-12 flex justify-center animate-bounce">
            <button
              onClick={scrollToProducts}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Scroll to products"
            >
              <ChevronDown className="h-8 w-8" />
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 md:gap-12">
          {[
            { icon: "🏠", textEn: "Homemade", textTa: "வீட்டு செய்முறை" },
            { icon: "🌿", textEn: "Natural Ingredients", textTa: "இயற்கை பொருட்கள்" },
            { icon: "❤️", textEn: "Made with Love", textTa: "அன்புடன் தயாரிப்பு" },
            { icon: "🚫", textEn: "No Preservatives", textTa: "பதப்படுத்திகள் இல்லை" },
          ].map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-3xl">{badge.icon}</span>
              <span className="mt-2 font-medium text-foreground">{badge.textEn}</span>
              <span className="text-xs text-muted-foreground tamil-text">{badge.textTa}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
