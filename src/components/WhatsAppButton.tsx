import React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton: React.FC = () => {
  // Placeholder WhatsApp number - replace with actual number
  const whatsappNumber = "919876543210";
  const message = encodeURIComponent(
    "Hi! I'm interested in ordering homemade snacks and sweets. / வணக்கம்! வீட்டு தின்பண்டங்கள் ஆர்டர் செய்ய விரும்புகிறேன்."
  );

  const handleClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-success hover:bg-success/90 shadow-lg hover:shadow-xl transition-all"
      size="icon"
      aria-label="Order via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </Button>
  );
};

export default WhatsAppButton;
