import React from "react";
import { Phone, Mail, MapPin, Heart } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-foreground text-background pb-safe-bottom">
      {/* Main Footer */}
      <div className="container px-4 md:px-8 py-10 md:py-14">
        <div className="grid gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
              <span className="text-2xl">🍯</span>
              <div>
                <h3 className="font-serif text-xl md:text-2xl font-bold">Maghizam</h3>
                <p className="text-[10px] md:text-xs text-background/60 -mt-0.5">Homemade Delights</p>
              </div>
            </div>
            <p className="text-sm md:text-base text-background/75 leading-relaxed">
              Bringing traditional homemade snacks and sweets to your doorstep with authentic Tamil flavors.
            </p>
            <p className="mt-1.5 text-xs text-background/50 tamil-text">
              பாரம்பரிய வீட்டு தின்பண்டங்களை உங்கள் வீட்டிற்கு கொண்டு வருகிறோம்.
            </p>
          </div>

          {/* Contact */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-base md:text-lg mb-4">
              Contact Us
              <span className="text-xs text-background/50 tamil-text ml-2">தொடர்பு கொள்ள</span>
            </h4>
            <div className="space-y-3">
              <a href="tel:+919751188414" className="flex items-center gap-3 justify-center sm:justify-start group">
                <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Phone className="h-4 w-4 text-gold" />
                </div>
                <span className="text-sm text-background/80 group-hover:text-gold transition-colors">+91 97511 88414</span>
              </a>
              <a href="mailto:contact.tdhms@gmail.com" className="flex items-center gap-3 justify-center sm:justify-start group">
                <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <Mail className="h-4 w-4 text-gold" />
                </div>
                <span className="text-xs md:text-sm text-background/80 group-hover:text-gold transition-colors break-all">contact.tdhms@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 justify-center sm:justify-start">
                <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-gold" />
                </div>
                <span className="text-sm text-background/80">Vaiyappamalai, Namakkal-637410, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-base md:text-lg mb-4">
              Quick Links
              <span className="text-xs text-background/50 tamil-text ml-2">விரைவு இணைப்புகள்</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
              {[
                { href: "#sweets", label: "Sweets", ta: "இனிப்புகள்" },
                { href: "#snacks", label: "Snacks", ta: "தின்பண்டங்கள்" },
                { href: "#pickles", label: "Pickles", ta: "ஊறுகாய்" },
                { href: "#feedback", label: "Reviews", ta: "மதிப்புரைகள்" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-background/75 hover:text-gold transition-colors py-1.5 justify-center sm:justify-start"
                >
                  <span className="w-1 h-1 rounded-full bg-gold/50" />
                  {link.label}
                  <span className="text-[10px] text-background/40 tamil-text">{link.ta}</span>
                </a>
              ))}

            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container px-4 py-4 md:py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center">
            <p className="text-xs md:text-sm text-background/50">
              © 2024 Maghizam Homemade Delights. All rights reserved.
            </p>
            <p className="text-[10px] text-background/30 tamil-text flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-destructive inline fill-current" /> in Tamil Nadu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;