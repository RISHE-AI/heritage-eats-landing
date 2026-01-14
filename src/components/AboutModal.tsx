import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Heart, Leaf, Shield } from "lucide-react";

interface AboutModalProps {
  trigger?: React.ReactNode;
}

const AboutModal: React.FC<AboutModalProps> = ({ trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="flex flex-col items-center">
            <span className="text-sm font-medium">About</span>
            <span className="text-xs text-muted-foreground tamil-text">எங்களை பற்றி</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center">
            About Homemade Delights
            <span className="block text-lg text-muted-foreground tamil-text mt-1">
              வீட்டு சமையல் சுவைகள் பற்றி
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-primary flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Our Story
            </h3>
            <p className="text-foreground leading-relaxed">
              Homemade Delights is a family-run business dedicated to bringing you the authentic taste of traditional South Indian snacks and sweets. Every product is handcrafted with love, using recipes passed down through generations.
            </p>
            <p className="text-muted-foreground tamil-text">
              வீட்டு சமையல் சுவைகள் என்பது பாரம்பரிய தென்னிந்திய தின்பண்டங்கள் மற்றும் இனிப்புகளின் உண்மையான சுவையை உங்களுக்கு வழங்க அர்ப்பணிக்கப்பட்ட ஒரு குடும்ப நிறுவனம். ஒவ்வொரு தயாரிப்பும் தலைமுறைகளாக கைமாற்றப்பட்ட சமையல் குறிப்புகளைப் பயன்படுத்தி அன்புடன் கைவினையாக தயாரிக்கப்படுகிறது.
            </p>
          </div>

          {/* Philosophy */}
          <div className="space-y-3 bg-secondary/30 p-4 rounded-lg">
            <h3 className="font-serif text-lg font-semibold text-primary flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Our Philosophy
            </h3>
            <ul className="space-y-2 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>100% Natural:</strong> No artificial colors, flavors, or preservatives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Fresh Ingredients:</strong> We source the finest ingredients locally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Small Batches:</strong> Made fresh to order for maximum quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Traditional Methods:</strong> Time-honored cooking techniques</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground tamil-text mt-3">
              100% இயற்கை • புதிய பொருட்கள் • சிறிய தொகுதிகள் • பாரம்பரிய முறைகள்
            </p>
          </div>

          {/* Quality Promise */}
          <div className="space-y-3 bg-success/10 p-4 rounded-lg">
            <h3 className="font-serif text-lg font-semibold text-success flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quality & Hygiene Promise
            </h3>
            <p className="text-foreground">
              We maintain the highest standards of hygiene in our kitchen. All products are prepared in a clean, sanitized environment following strict food safety guidelines. Your health and satisfaction are our top priorities.
            </p>
            <p className="text-sm text-muted-foreground tamil-text">
              நாங்கள் எங்கள் சமையலறையில் மிக உயர்ந்த சுகாதார தரங்களை பராமரிக்கிறோம். உங்கள் ஆரோக்கியமும் திருப்தியும் எங்கள் முதன்மை முன்னுரிமைகள்.
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-serif text-lg font-semibold text-primary">
              Contact Us / தொடர்பு கொள்ளுங்கள்
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">+91 98765 43210</p>
                  <p className="text-xs text-muted-foreground">WhatsApp / வாட்ஸ்அப்</p>
                </div>
              </a>
              <a
                href="mailto:homemadedelights@gmail.com"
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-foreground text-sm">homemadedelights@gmail.com</p>
                  <p className="text-xs text-muted-foreground">Email / மின்னஞ்சல்</p>
                </div>
              </a>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Chennai, Tamil Nadu</p>
                <p className="text-sm text-muted-foreground">சென்னை, தமிழ்நாடு</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutModal;
