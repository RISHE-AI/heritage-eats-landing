import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth, CustomerDetails } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import CustomerDetailsForm from "@/components/CustomerDetailsForm";
import OrderConfirmationDialog from "@/components/OrderConfirmationDialog";
import RazorpayPayment from "@/components/RazorpayPayment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle, Clock, AlertTriangle, Sparkles, Shield, Truck, Package } from "lucide-react";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/useConfetti";

const STEPS = [
  { label: "Cart", labelTa: "கார்ட்" },
  { label: "Details", labelTa: "விவரங்கள்" },
  { label: "Payment", labelTa: "பணம்" },
];

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

  const currentStep = paymentConfirmed ? 3 : showPayment ? 2 : 0;

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

  const getRemainingTime = () => {
    const now = new Date();
    const diff = cartExpiryTime.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  };

  // Unauthenticated
  if (!user && !paymentConfirmed) {
    return (
      <div className="min-h-screen bg-background page-enter pb-safe-bottom">
        <Header />
        <div className="container px-4 py-16 max-w-md mx-auto text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Please Login to Continue</h1>
          <p className="text-sm text-muted-foreground tamil-text mb-6">தொடர உள்நுழையவும்</p>
          <p className="text-sm text-muted-foreground mb-6">Login or sign up to view your cart and place orders.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="rounded-xl btn-lift">Login / Sign Up</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/")} className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
            </Button>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Empty Cart
  if (items.length === 0 && !paymentConfirmed) {
    return (
      <div className="min-h-screen bg-background page-enter pb-safe-bottom">
        <Header />
        <div className="container px-4 py-16 max-w-md mx-auto text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-sm text-muted-foreground tamil-text mb-6">உங்கள் கார்ட் காலியாக உள்ளது</p>
          <Button size="lg" onClick={() => navigate("/")} className="rounded-xl btn-lift">
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Button>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Payment Confirmed
  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-background page-enter pb-safe-bottom">
        <Header />
        <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-lg mx-auto text-center animate-fade-in">
          <div className="animate-scale-in">
            <div className="relative inline-block">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-success" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 text-gold animate-pulse" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold mb-1">Order Placed Successfully!</h1>
            <p className="text-sm sm:text-base text-muted-foreground tamil-text mb-4 sm:mb-5">ஆர்டர் வெற்றிகரமாக வைக்கப்பட்டது!</p>
            <Card className="rounded-2xl mb-5 sm:mb-6 shadow-card">
              <CardContent className="p-4 sm:p-5 space-y-2 sm:space-y-2.5 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Order ID</span>
                  <span className="font-mono font-semibold text-xs sm:text-sm truncate max-w-[55%] text-right">{orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Total Paid</span>
                  <span className="font-bold text-lg sm:text-xl text-primary">₹{finalTotal}</span>
                </div>
                {customerDetails && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground shrink-0">Delivery to</span>
                    <span className="text-xs sm:text-sm text-right max-w-[60%] break-words">{customerDetails.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground mb-4 sm:mb-5">
              Thank you! We will contact you shortly.
              <span className="block tamil-text mt-0.5">உங்கள் ஆர்டருக்கு நன்றி!</span>
            </p>
            <div className="flex flex-col gap-3">
              <Button size="lg" onClick={handleViewInvoice} className="w-full rounded-xl btn-lift gap-2" aria-label="View invoice">View Invoice</Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")} className="w-full rounded-xl" aria-label="Back to home">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </div>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-enter pb-safe-bottom">
      <Header />
      <div className="px-4 sm:px-6 py-4 sm:py-6 md:py-10 max-w-6xl mx-auto">
        {/* Step Progress */}
        <div className="max-w-md mx-auto mb-6 md:mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
            <div className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500" style={{ width: `${(currentStep / 2) * 100}%` }} />
            {STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= currentStep ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-muted-foreground"
                  }`}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span className="text-[10px] font-medium mt-1 text-muted-foreground">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back + Timer */}
        <div className="flex items-center justify-between mb-5">
          <Button variant="ghost" size="sm" onClick={() => showPayment ? setShowPayment(false) : navigate("/")} className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            {showPayment ? "Back to Details" : "Back to Shop"}
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            <span>Reserved {getRemainingTime()}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Cart Summary */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-2xl shadow-card overflow-hidden">
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary/30 border-b">
                <h2 className="font-serif text-sm font-bold flex items-center justify-between">
                  <span>
                    Order Summary
                    <span className="text-xs font-normal text-muted-foreground tamil-text ml-2">ஆர்டர் சுருக்கம்</span>
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </h2>
              </div>
              <CardContent className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.selectedWeight}`} className="p-2.5 sm:p-3 rounded-xl bg-secondary/20 border border-border/30">
                    {/* Item Header: Image + Name + Remove */}
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.nameEn}
                        className="h-16 w-16 sm:h-14 sm:w-14 rounded-lg object-cover shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium truncate">{item.product.nameEn}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{item.selectedWeight}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedWeight)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Quantity Controls + Price */}
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex items-center bg-background rounded-lg border border-border h-8">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 flex items-center justify-center rounded-l-lg hover:bg-muted transition-colors disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.quantity + 1)}
                              className="h-8 w-8 flex items-center justify-center rounded-r-lg hover:bg-muted transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-primary tabular-nums">₹{item.unitPrice * item.quantity}</p>
                        </div>
                      </div>
                    </div>

                    {/* Custom Message */}
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Custom message (optional)..."
                        className="w-full text-xs p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 input-glow"
                        value={item.customMessage || ''}
                        onChange={(e) => updateCustomMessage(item.product.id, item.selectedWeight, e.target.value)}
                        maxLength={100}
                      />
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>Delivery</span>
                    <span className={`tabular-nums ${deliveryCharge === 0 ? "text-success font-medium" : ""}`}>
                      {deliveryCharge === 0 ? "FREE ✓" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-[10px] text-muted-foreground">₹60/kg • Free above ₹1000</p>
                  )}
                  <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2.5">
                    <span>Total</span>
                    <span className="text-primary tabular-nums">₹{grandTotal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Notice */}
            <div className="flex gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-amber-800 dark:text-amber-400">Cancellation Policy</p>
                <p className="text-muted-foreground mt-0.5">
                  Orders cannot be cancelled 30 min after payment.
                  <span className="block tamil-text text-[10px] mt-0.5">பணம் செலுத்திய 30 நிமிடங்களுக்குப் பிறகு ரத்து செய்ய முடியாது.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details or Payment */}
          <div className="lg:col-span-3">
            {!showPayment ? (
              <CustomerDetailsForm onDetailsSubmit={handleDetailsSubmit} isSubmitting={isProcessing} />
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
                <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowPayment(false)} disabled={isProcessing} aria-label="Go back to details">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {customerDetails && (
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
      )}
      <MobileBottomNav />
    </div>
  );
};

export default Checkout;
