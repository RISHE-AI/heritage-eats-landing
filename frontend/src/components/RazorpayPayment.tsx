import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Loader2 } from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/services/api";

interface RazorpayPaymentProps {
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  orderData: any;
  onSuccess: (data: { orderId: string; razorpayPaymentId: string }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  orderData,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);

    try {
      // Step 1: Create Razorpay order on backend
      const orderResult = await createRazorpayOrder(amount);

      if (!orderResult.success || !orderResult.data) {
        throw new Error(orderResult.message || "Failed to create payment order");
      }

      const { orderId: razorpayOrderId, key } = orderResult.data;

      // Step 2: Load Razorpay checkout script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load payment gateway. Please check your internet connection.");
      }

      // Step 3: Open Razorpay checkout popup
      const options = {
        key,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "Heritage Eats",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail || "",
          contact: customerPhone,
        },
        theme: {
          color: "#8B2323",
        },
        handler: async function (response: any) {
          // Step 4: Verify payment on backend
          try {
            const verifyResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData,
            });

            if (verifyResult.success) {
              onSuccess({
                orderId: verifyResult.data.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
              });
            } else {
              onError(verifyResult.message || "Payment verification failed");
            }
          } catch (verifyError: any) {
            console.error("Verification error:", verifyError);
            onError(verifyError.message || "Payment verification failed. Please contact support.");
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        onError(response.error.description || "Payment failed");
        setIsLoading(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      onError(error.message || "Payment initialization failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-card overflow-hidden rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 sm:px-6">
        <CardTitle className="font-serif flex items-center gap-2 text-base sm:text-lg">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
          Secure Payment
          <span className="text-xs sm:text-sm font-normal text-muted-foreground tamil-text ml-auto">
            பாதுகாப்பான பணம்
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Amount Display */}
        <div className="text-center p-3 sm:p-4 bg-secondary/50 rounded-xl">
          <p className="text-xs sm:text-sm text-muted-foreground">Amount to Pay</p>
          <p className="text-3xl sm:text-4xl font-bold text-primary mt-1">₹{amount}</p>
        </div>

        {/* Payment Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            You will be redirected to Razorpay's secure payment gateway
          </p>
          <p className="text-xs text-muted-foreground">
            Supports UPI, Cards, Net Banking & Wallets
          </p>
        </div>

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
              <span className="hidden sm:inline">Pay ₹{amount} with Razorpay</span>
              <span className="sm:hidden">Pay ₹{amount}</span>
              <span className="text-xs sm:text-sm tamil-text font-normal">பணம் செலுத்து</span>
            </>
          )}
        </Button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-success" />
          <span>256-bit SSL Encrypted | 100% Secure Payment</span>
        </div>

        {/* Payment Partner Logo */}
        <div className="flex justify-center items-center gap-4 pt-2 opacity-60">
          <div className="h-6 w-20 bg-muted rounded flex items-center justify-center text-xs font-medium">
            Razorpay
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;
