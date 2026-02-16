import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Package } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-foreground text-background py-8 md:py-12">
      <div className="container px-4 md:px-8">
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <h3 className="font-serif text-xl md:text-2xl font-bold">Homemade Delights</h3>
            <p className="mt-1 text-xs md:text-sm text-background/70 tamil-text">வீட்டு சமையல் சுவைகள்</p>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-background/80">
              Bringing traditional homemade snacks and sweets to your doorstep.
            </p>
            <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-background/60 tamil-text">
              பாரம்பரிய வீட்டு தின்பண்டங்களை உங்கள் வீட்டிற்கு கொண்டு வருகிறோம்.
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4">
              Contact Us / தொடர்பு கொள்ள
            </h4>
            <div className="space-y-2.5 md:space-y-3">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <Phone className="h-4 w-4 md:h-5 md:w-5 text-gold shrink-0" />
                <span className="text-sm md:text-base">+91 97511 88414</span>
              </div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <Mail className="h-4 w-4 md:h-5 md:w-5 text-gold shrink-0" />
                <span className="text-xs md:text-sm break-all">contact.tdhms@gmail.com</span>
              </div>
              <div className="flex items-start gap-3 justify-center sm:justify-start">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-gold shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">Vaiyappamalai, Namakkal-637410, Tamil Nadu, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-base md:text-lg mb-3 md:mb-4">
              Quick Links / விரைவு இணைப்புகள்
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 md:gap-2">
              <a href="#sweets" className="block text-sm md:text-base text-background/80 hover:text-gold transition-colors py-1">
                Sweets / இனிப்புகள்
              </a>
              <a href="#snacks" className="block text-sm md:text-base text-background/80 hover:text-gold transition-colors py-1">
                Snacks / தின்பண்டங்கள்
              </a>
              <a href="#pickles" className="block text-sm md:text-base text-background/80 hover:text-gold transition-colors py-1">
                Pickles / ஊறுகாய்
              </a>
              <a href="#feedback" className="block text-sm md:text-base text-background/80 hover:text-gold transition-colors py-1">
                Reviews / மதிப்புரைகள்
              </a>
              <Link 
                to="/track-order" 
                className="flex items-center gap-1.5 text-sm md:text-base text-background/80 hover:text-gold transition-colors py-1"
              >
                <Package className="h-4 w-4" />
                Track Order / ஆர்டர் கண்காணி
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-background/20 text-center text-xs md:text-sm text-background/60">
          <p>© 2024 Homemade Delights. All rights reserved.</p>
          <p className="mt-1 tamil-text text-[10px] md:text-xs">© 2024 வீட்டு சமையல் சுவைகள். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;