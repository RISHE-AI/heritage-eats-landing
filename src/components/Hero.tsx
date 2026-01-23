import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Phone } from "lucide-react";

const Hero: React.FC = () => {
  const scrollToProducts = () => {
    document.querySelector("#sweets")?.scrollIntoView({ behavior: "smooth" });
  };

  const whatsappNumber = "919876543210";
  const whatsappMessage = encodeURIComponent("Hi! I'm interested in your homemade products.");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-10 md:py-16 lg:py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-48 md:h-72 w-48 md:w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-48 md:h-72 w-48 md:w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* English Content */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground animate-fade-in">
            Traditional Homemade
            <span className="block text-primary">Snacks & Sweets</span>
          </h1>
          
          {/* Tamil Content */}
          <h2 className="mt-2 md:mt-4 font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-muted-foreground animate-fade-in tamil-text">
            பாரம்பரிய வீட்டு தின்பண்டங்கள்
            <span className="block text-primary/80">மற்றும் இனிப்புகள்</span>
          </h2>

          <p className="mt-4 md:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground animate-fade-in px-2">
            Made with love, tradition, and the finest ingredients.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Experience the authentic taste of homemade goodness.
          </p>
          
          <p className="mt-1.5 md:mt-2 text-xs sm:text-sm md:text-base text-muted-foreground tamil-text animate-fade-in px-2">
            அன்பு, பாரம்பரியம் மற்றும் சிறந்த பொருட்களுடன் தயாரிக்கப்படுகிறது.
          </p>

          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center animate-fade-in px-4">
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="w-full sm:w-auto gap-2 text-sm md:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 h-11 md:h-12"
            >
              <span>Explore Products</span>
              <span className="tamil-text text-[10px] md:text-xs lg:text-sm hidden sm:inline">தயாரிப்புகளை காண்க</span>
            </Button>
            
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 text-sm md:text-base lg:text-lg border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all hover:scale-105 h-11 md:h-12"
              >
                <Phone className="h-4 w-4 md:h-5 md:w-5" />
                <span>WhatsApp Us</span>
                <span className="tamil-text text-[10px] md:text-xs lg:text-sm hidden sm:inline">வாட்ஸ்அப்</span>
              </Button>
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="mt-8 md:mt-12 flex justify-center animate-bounce">
            <button
              onClick={scrollToProducts}
              className="text-muted-foreground hover:text-primary transition-colors p-2"
              aria-label="Scroll to products"
            >
              <ChevronDown className="h-6 w-6 md:h-8 md:w-8" />
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-10 md:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 lg:gap-12 justify-items-center px-4">
          {[
            { icon: "🏠", textEn: "Homemade", textTa: "வீட்டு செய்முறை" },
            { icon: "🌿", textEn: "Natural", textTa: "இயற்கை" },
            { icon: "❤️", textEn: "With Love", textTa: "அன்புடன்" },
            { icon: "🚫", textEn: "No Preservatives", textTa: "பதப்படுத்திகள் இல்லை" },
          ].map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-2xl md:text-3xl">{badge.icon}</span>
              <span className="mt-1.5 md:mt-2 text-xs md:text-sm font-medium text-foreground">{badge.textEn}</span>
              <span className="text-[10px] md:text-xs text-muted-foreground tamil-text">{badge.textTa}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;