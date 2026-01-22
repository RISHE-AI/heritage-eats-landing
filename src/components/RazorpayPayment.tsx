import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Loader2, CheckCircle, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface RazorpayPaymentProps {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

// Placeholder configuration - replace with actual keys
const RAZORPAY_KEY_ID = "rzp_test_placeholder";

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "wallet">("upi");

  const paymentMethods = [
    { id: "upi" as const, label: "UPI", icon: Smartphone, description: "Google Pay, PhonePe, Paytm" },
    { id: "card" as const, label: "Card", icon: CreditCard, description: "Credit/Debit Card" },
    { id: "wallet" as const, label: "Wallet", icon: Wallet, description: "Paytm, Mobikwik" },
  ];

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === "undefined") {
        // For now, simulate a successful payment since we're using placeholder
        console.log("Razorpay SDK not loaded - simulating payment");
        
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate mock payment details
        const mockPaymentId = `pay_${Date.now().toString(36)}`;
        const mockSignature = `sig_${Date.now().toString(36)}`;
        
        onSuccess(mockPaymentId, orderId, mockSignature);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        name: "Homemade Delights",
        description: `Order #${orderId}`,
        order_id: orderId,
        prefill: {
          name: customerName,
          email: customerEmail || "",
          contact: customerPhone,
        },
        theme: {
          color: "#8B2323", // Primary maroon color
        },
        handler: function (response: any) {
          onSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        onError(response.error.description);
        setIsLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      onError("Payment initialization failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="font-serif flex items-center gap-2">
          <Shield className="h-5 w-5 text-success" />
          Secure Payment
          <span className="block text-lg font-normal text-muted-foreground tamil-text ml-auto">
            பாதுகாப்பான பணம்
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Amount Display */}
        <div className="text-center p-4 bg-secondary/50 rounded-xl">
          <p className="text-sm text-muted-foreground">Amount to Pay</p>
          <p className="text-4xl font-bold text-primary mt-1">₹{amount}</p>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Select Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-200 text-center",
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <method.icon className={cn(
                  "h-6 w-6 mx-auto mb-1",
                  selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="text-xs font-medium block">{method.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {paymentMethods.find(m => m.id === selectedMethod)?.description}
          </p>
        </div>

        {/* UPI Quick Pay Options */}
        {selectedMethod === "upi" && (
          <div className="flex justify-center gap-4 p-4 bg-secondary/30 rounded-lg animate-fade-in">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-1 rounded-full bg-background flex items-center justify-center shadow-sm">
                <span className="text-lg">📱</span>
              </div>
              <span className="text-xs text-muted-foreground">GPay</span>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-1 rounded-full bg-background flex items-center justify-center shadow-sm">
                <span className="text-lg">💜</span>
              </div>
              <span className="text-xs text-muted-foreground">PhonePe</span>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-1 rounded-full bg-background flex items-center justify-center shadow-sm">
                <span className="text-lg">🔵</span>
              </div>
              <span className="text-xs text-muted-foreground">Paytm</span>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold gap-2"
          onClick={handlePayment}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Pay ₹{amount}
              <span className="text-sm tamil-text font-normal">பணம் செலுத்து</span>
            </>
          )}
        </Button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-success" />
          <span>256-bit SSL Encrypted | 100% Secure Payment</span>
        </div>

        {/* Payment Partner Logos (Placeholder) */}
        <div className="flex justify-center items-center gap-4 pt-2 opacity-50">
          <div className="h-6 w-16 bg-muted rounded flex items-center justify-center text-xs">Razorpay</div>
          <div className="h-6 w-12 bg-muted rounded flex items-center justify-center text-xs">UPI</div>
          <div className="h-6 w-12 bg-muted rounded flex items-center justify-center text-xs">VISA</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;
