import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, Phone, Shield, Truck, Leaf, Heart, Award, Package, Building2, ShoppingBag } from "lucide-react";

const TRUST_BADGES = [
  { icon: "🏠", Icon: null, textEn: "100% Homemade", textTa: "வீட்டு செய்முறை", delay: 0 },
  { icon: null, Icon: Leaf, textEn: "No Preservatives", textTa: "பதப்படுத்திகள் இல்லை", delay: 100 },
  { icon: null, Icon: Shield, textEn: "Secure Payments", textTa: "பாதுகாப்பான பணம்", delay: 200 },
  { icon: null, Icon: Truck, textEn: "Fast Delivery", textTa: "விரைவான டெலிவரி", delay: 300 },
  { icon: null, Icon: Award, textEn: "Tamil Tradition", textTa: "தமிழ் பாரம்பரியம்", delay: 400 },
];

const FLOATING_ITEMS = ["🍬", "🍪", "🌶️", "🍯", "✨", "🌿"];

const Hero: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToProducts = () => {
    document.querySelector("#sweets")?.scrollIntoView({ behavior: "smooth" });
  };

  const whatsappNumber = "916383240322";
  const whatsappMessage = encodeURIComponent("Hi! I'm interested in your homemade products.");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      >
        <div className="absolute -right-20 -top-20 h-56 md:h-80 w-56 md:w-80 rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 md:h-80 w-56 md:w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {FLOATING_ITEMS.map((item, i) => (
          <span
            key={i}
            className={`absolute text-lg md:text-2xl opacity-[0.12] select-none ${i % 2 === 0 ? "animate-float" : "animate-float-delayed"
              }`}
            style={{
              left: `${12 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDuration: `${3 + i * 0.7}s`,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Hero Content */}
      <div className="container relative px-4 md:px-8 pt-10 md:pt-16 lg:pt-24 pb-6 md:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground animate-fade-in">
            Maghizam Homemade Delights
            <span className="block text-primary mt-1 md:mt-2">Snacks & Sweets</span>
          </h1>

          {/* Tamil Heading */}
          <h2 className="mt-2 md:mt-3 font-serif text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-muted-foreground animate-fade-in tamil-text">
            மகிழம் வீட்டு தின்பண்டங்கள்
            <span className="block text-primary/70 text-sm sm:text-base md:text-lg">மற்றும் இனிப்புகள்</span>
          </h2>

          {/* Description */}
          <p className="mt-4 md:mt-5 text-sm sm:text-base md:text-lg text-muted-foreground animate-fade-in px-2 max-w-xl mx-auto">
            Made with love, tradition, and the finest ingredients.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Experience the authentic taste of homemade goodness.
          </p>

          <p className="mt-1 text-xs sm:text-sm text-muted-foreground/70 tamil-text animate-fade-in px-2">
            அன்பு, பாரம்பரியம் மற்றும் சிறந்த பொருட்களுடன் தயாரிக்கப்படுகிறது.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center animate-fade-in px-4">
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="w-full sm:w-auto gap-2 text-sm md:text-base shadow-lg btn-lift ripple h-11 md:h-12 rounded-xl"
            >
              <span>Explore Products</span>
              <span className="tamil-text text-[10px] md:text-xs hidden sm:inline opacity-80">தயாரிப்புகளை காண்க</span>
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
                className="w-full gap-2 text-sm md:text-base border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white btn-lift h-11 md:h-12 rounded-xl"
              >
                <Phone className="h-4 w-4 md:h-5 md:w-5" />
                <span>WhatsApp Us</span>
              </Button>
            </a>
          </div>

          <div className="mt-3 md:mt-4 flex flex-col sm:flex-row items-center gap-3 justify-center animate-fade-in px-4">
             <Link to="/track" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full gap-2 text-sm md:text-base btn-lift h-11 md:h-12 rounded-xl border border-border/50 bg-secondary/80 hover:bg-secondary">
                   <Package className="h-4 w-4 md:h-5 md:w-5" />
                   <span>Track Order</span>
                </Button>
             </Link>
             <Link to="/about" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full gap-2 text-sm md:text-base btn-lift h-11 md:h-12 rounded-xl border border-border/50 bg-secondary/80 hover:bg-secondary">
                   <Building2 className="h-4 w-4 md:h-5 md:w-5" />
                   <span>About Us</span>
                </Button>
             </Link>
             <Link to="/bulk-order" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full gap-2 text-sm md:text-base btn-lift h-11 md:h-12 rounded-xl border border-border/50 bg-secondary/80 hover:bg-secondary">
                   <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                   <span>Bulk Order</span>
                </Button>
             </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-8 md:mt-10 flex justify-center">
            <button
              onClick={scrollToProducts}
              className="text-muted-foreground hover:text-primary transition-colors p-2 animate-bounce"
              aria-label="Scroll to products"
            >
              <ChevronDown className="h-6 w-6 md:h-7 md:w-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Trust / Why Choose Us Section */}
      <div className="container px-4 pb-10 md:pb-16">
        <h3 className="text-center font-serif text-lg md:text-xl font-bold text-foreground mb-6 md:mb-8 animate-fade-in">
          Why Choose Us
          <span className="block text-xs md:text-sm font-normal text-muted-foreground tamil-text mt-1">
            ஏன் எங்களை தேர்வு செய்ய வேண்டும்
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 max-w-4xl mx-auto">
          {TRUST_BADGES.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-3 md:p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/30 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
              style={{ animationDelay: `${badge.delay}ms` }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/15 transition-colors">
                {badge.icon ? (
                  <span className="text-xl md:text-2xl">{badge.icon}</span>
                ) : badge.Icon ? (
                  <badge.Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                ) : null}
              </div>
              <span className="text-xs md:text-sm font-semibold text-foreground leading-tight">{badge.textEn}</span>
              <span className="text-[10px] md:text-xs text-muted-foreground tamil-text mt-0.5">{badge.textTa}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;