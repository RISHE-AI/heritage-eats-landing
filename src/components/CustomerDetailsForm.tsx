import React, { useState, useEffect } from "react";
import { useAuth, CustomerDetails } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Phone, Mail, MapPin, AlertCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CustomerDetailsFormProps {
  onDetailsSubmit: (details: CustomerDetails) => void;
  isSubmitting?: boolean;
}

const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
  onDetailsSubmit,
  isSubmitting = false
}) => {
  const navigate = useNavigate();
  const { user, savedCustomerDetails, saveCustomerDetails } = useAuth();
  
  const [formData, setFormData] = useState<CustomerDetails>({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  
  const [saveDetails, setSaveDetails] = useState(true);
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});

  // Auto-fill from user profile or saved details
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || ""
      });
    } else if (savedCustomerDetails) {
      setFormData(savedCustomerDetails);
    }
  }, [user, savedCustomerDetails]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerDetails> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Delivery address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address with pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const cleanedDetails: CustomerDetails = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email?.trim() || undefined,
      address: formData.address.trim()
    };

    // Save details if checkbox is checked
    if (saveDetails) {
      saveCustomerDetails(cleanedDetails);
    }

    onDetailsSubmit(cleanedDetails);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-serif">
          Customer Details
          <span className="block text-lg font-normal text-muted-foreground tamil-text">
            வாடிக்கையாளர் விவரங்கள்
          </span>
        </CardTitle>
        {!user && (
          <div className="flex items-center gap-2 mt-2 p-3 bg-primary/10 rounded-lg">
            <LogIn className="h-4 w-4 text-primary" />
            <span className="text-sm">
              <button 
                onClick={() => navigate("/auth")} 
                className="text-primary font-medium hover:underline"
              >
                Login
              </button>
              {" "}to auto-fill your details
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name / முழு பெயர் *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number / தொலைபேசி எண் *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="10-digit phone number (e.g., 9876543210)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className={errors.phone ? "border-destructive" : ""}
              maxLength={10}
            />
            {errors.phone && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address / மின்னஞ்சல் (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? "border-destructive" : ""}
              maxLength={255}
            />
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address / டெலிவரி முகவரி *
            </Label>
            <div className="p-2 bg-secondary/50 rounded-md text-xs text-muted-foreground mb-2">
              <span className="font-medium">Delivery Info:</span> ₹60/kg delivery charge OR FREE delivery for orders above ₹1000
              <span className="block tamil-text mt-1">
                கிலோவுக்கு ₹60 டெலிவரி அல்லது ₹1000க்கு மேல் இலவச டெலிவரி
              </span>
            </div>
            <Textarea
              id="address"
              placeholder="Enter your full delivery address including house/flat number, street, area, city, and pincode"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={errors.address ? "border-destructive" : ""}
              rows={3}
              maxLength={500}
            />
            {errors.address && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.address}
              </p>
            )}
          </div>

          {/* Save Details Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="save-details"
              checked={saveDetails}
              onCheckedChange={(checked) => setSaveDetails(checked === true)}
            />
            <Label htmlFor="save-details" className="text-sm font-normal cursor-pointer">
              Save my details for faster checkout next time
              <span className="block text-xs text-muted-foreground tamil-text">
                அடுத்த முறை வேகமான செக்அவுட்டுக்கு என் விவரங்களைச் சேமி
              </span>
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-4" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Proceed to Payment / பணம் செலுத்த தொடரவும்"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomerDetailsForm;
