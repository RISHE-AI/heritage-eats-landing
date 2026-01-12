import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-bold">Homemade Delights</h3>
            <p className="mt-1 text-sm text-background/70 tamil-text">வீட்டு சமையல் சுவைகள்</p>
            <p className="mt-4 text-background/80">
              Bringing traditional homemade snacks and sweets to your doorstep.
            </p>
            <p className="mt-2 text-sm text-background/60 tamil-text">
              பாரம்பரிய வீட்டு தின்பண்டங்களை உங்கள் வீட்டிற்கு கொண்டு வருகிறோம்.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              Contact Us / தொடர்பு கொள்ள
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold" />
                <span>orders@homemadedelights.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold flex-shrink-0" />
                <span>Chennai, Tamil Nadu, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              Quick Links / விரைவு இணைப்புகள்
            </h4>
            <div className="space-y-2">
              <a href="#sweets" className="block text-background/80 hover:text-gold transition-colors">
                Sweets / இனிப்புகள்
              </a>
              <a href="#snacks" className="block text-background/80 hover:text-gold transition-colors">
                Snacks / தின்பண்டங்கள்
              </a>
              <a href="#pickles" className="block text-background/80 hover:text-gold transition-colors">
                Pickles / ஊறுகாய்
              </a>
              <a href="#feedback" className="block text-background/80 hover:text-gold transition-colors">
                Reviews / மதிப்புரைகள்
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-background/20 text-center text-sm text-background/60">
          <p>© 2024 Homemade Delights. All rights reserved.</p>
          <p className="mt-1 tamil-text">© 2024 வீட்டு சமையல் சுவைகள். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
