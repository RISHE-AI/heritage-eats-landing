import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth, CustomerDetails } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import CustomerDetailsForm from "@/components/CustomerDetailsForm";
import OrderConfirmationDialog from "@/components/OrderConfirmationDialog";
import RazorpayPayment from "@/components/RazorpayPayment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/useConfetti";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, updateWeight, updateCustomMessage, removeFromCart, totalPrice, clearCart, deliveryCharge, grandTotal } = useCart();
  const { user } = useAuth();
  const { fireConfetti, fireStars } = useConfetti();

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartExpiryTime] = useState(() => new Date(Date.now() + 30 * 60 * 1000));
  const [finalTotal, setFinalTotal] = useState(0);
  const [confirmedItems, setConfirmedItems] = useState<any[]>([]);

  const handleDetailsSubmit = (details: CustomerDetails) => {
    setCustomerDetails(details);
    setShowConfirmDialog(true);
  };

  const handleOrderConfirm = async () => {
    if (!customerDetails) return;
    setShowConfirmDialog(false);
    setShowPayment(true);
  };

  const handleRazorpaySuccess = (data: { orderId: string; razorpayPaymentId: string }) => {
    setOrderId(data.orderId);
    setPaymentConfirmed(true);
    setFinalTotal(grandTotal);
    setConfirmedItems(items);
    clearCart();

    fireConfetti();
    setTimeout(() => fireStars(), 300);
    toast.success("Payment successful! / பணம் செலுத்தப்பட்டது!");
  };

  const handleRazorpayError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    setIsProcessing(false);
  };

  const handleViewInvoice = () => {
    // Store order in localStorage for invoice page
    localStorage.setItem("currentOrder", JSON.stringify({
      id: orderId,
      customer: customerDetails,
      items: confirmedItems,
      subtotal: confirmedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
      deliveryCharge,
      total: finalTotal,
      createdAt: new Date().toISOString(),
    }));
    navigate("/invoice");
  };

  // Calculate remaining time for cart expiry
  const getRemainingTime = () => {
    const now = new Date();
    const diff = cartExpiryTime.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  };

  // Redirect to login if not authenticated
  if (!user && !paymentConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">
            Please Login to Continue
          </h1>
          <p className="text-muted-foreground tamil-text mb-6">
            தொடர உள்நுழையவும்
          </p>
          <p className="text-muted-foreground mb-6">
            You need to login or sign up to view your cart and place orders.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/auth")}>
              Login / Sign Up
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !paymentConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground tamil-text mb-6">
            உங்கள் கார்ட் காலியாக உள்ளது
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping / ஷாப்பிங் தொடரவும்
          </Button>
        </div>
      </div>
    );
  }

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16 max-w-lg mx-auto text-center">
          <div className="animate-scale-in">
            <div className="relative inline-block">
              <CheckCircle className="mx-auto h-20 w-20 text-success mb-6" />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-gold animate-pulse" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-xl text-muted-foreground tamil-text mb-4">
              ஆர்டர் வெற்றிகரமாக வைக்கப்பட்டது!
            </p>
            <div className="bg-gradient-to-br from-secondary/50 to-primary/5 rounded-xl p-6 mb-6 space-y-3 border border-border/50">
              <p className="text-muted-foreground">
                Order ID: <span className="font-mono font-semibold text-foreground">{orderId}</span>
              </p>
              <p className="text-muted-foreground">
                Total Paid: <span className="font-bold text-2xl text-primary">
                  ₹{finalTotal}
                </span>
              </p>
              {customerDetails && (
                <p className="text-muted-foreground text-sm">
                  Delivery to: {customerDetails.address}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Thank you for your order! We will contact you shortly.
              <span className="block tamil-text mt-1">
                உங்கள் ஆர்டருக்கு நன்றி! விரைவில் தொடர்பு கொள்வோம்.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={handleViewInvoice} className="gap-2">
                View Invoice / இன்வாய்ஸ் காண்க
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop / கடைக்கு திரும்பு
          </Button>

          {/* Cart Expiry Indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />
            <span>Reserved for {getRemainingTime()}</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-serif">
                  Order Summary
                  <span className="block text-lg font-normal text-muted-foreground tamil-text">
                    ஆர்டர் சுருக்கம்
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div
                    key={`${item.product.id}-${item.selectedWeight}`}
                    className="p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.nameEn}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.product.nameEn}</h4>
                        <p className="text-sm text-muted-foreground tamil-text truncate">
                          {item.product.nameTa}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Weight: {item.selectedWeight}
                        </p>
                        <p className="text-primary font-semibold">₹{item.unitPrice}</p>
                      </div>
                    </div>
                    {/* Custom Message Input */}
                    <div className="mt-3 w-full">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Custom Message (Optional) / தனிப்பயன் செய்தி (விருப்பினால்)
                      </label>
                      <input
                        type="text"
                        placeholder="eg: Less sugar Etc  //
                                     எ.கா: குறைந்த சர்க்கரை போன்றவை."
                        className="w-full text-sm p-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        value={item.customMessage || ''}
                        onChange={(e) => updateCustomMessage(item.product.id, item.selectedWeight, e.target.value)}
                        maxLength={100}
                      />
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal / துணை மொத்தம்:</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery / டெலிவரி:</span>
                    <span className={deliveryCharge === 0 ? "text-success" : ""}>
                      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ₹60/kg delivery charge. Free for orders above ₹1000!
                    </p>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total / மொத்தம்:</span>
                    <span className="text-primary">₹{grandTotal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Notice */}
            <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-400">
                  Important: Cancellation Policy
                </p>
                <p className="text-muted-foreground mt-1">
                  Orders cannot be cancelled after 30 minutes of payment confirmation.
                  <span className="block tamil-text text-xs mt-1">
                    பணம் செலுத்திய 30 நிமிடங்களுக்குப் பிறகு ஆர்டர்களை ரத்து செய்ய முடியாது.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details or Payment Section */}
          <div>
            {!showPayment ? (
              <CustomerDetailsForm
                onDetailsSubmit={handleDetailsSubmit}
                isSubmitting={isProcessing}
              />
            ) : (
              <div className="space-y-4">
                <RazorpayPayment
                  amount={grandTotal}
                  customerName={customerDetails?.name || ""}
                  customerPhone={customerDetails?.phone || ""}
                  customerEmail={customerDetails?.email}
                  orderData={{
                    customerId: user?._id || user?.id,
                    items: items.map(item => ({
                      productId: item.product.id,
                      name: item.product.nameEn,
                      weight: item.selectedWeight,
                      quantity: item.quantity,
                      price: item.unitPrice * item.quantity,
                      customMessage: item.customMessage || ''
                    })),
                    deliveryCharge,
                    totalAmount: grandTotal,
                    grandTotal
                  }}
                  onSuccess={handleRazorpaySuccess}
                  onError={handleRazorpayError}
                  disabled={isProcessing}
                />

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPayment(false)}
                  disabled={isProcessing}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Details
                </Button>
              </div>
            )}
          </div>
        </div >
      </div >

      {/* Order Confirmation Dialog */}
      {
        customerDetails && (
          <OrderConfirmationDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            onConfirm={handleOrderConfirm}
            customerDetails={customerDetails}
            items={items}
            grandTotal={grandTotal}
            deliveryCharge={deliveryCharge}
            isProcessing={isProcessing}
            onUpdateQuantity={updateQuantity}
            onUpdateWeight={updateWeight}
          />
        )
      }
    </div >
  );
};

export default Checkout;
