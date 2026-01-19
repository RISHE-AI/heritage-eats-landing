import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth, CustomerDetails } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import CustomerDetailsForm from "@/components/CustomerDetailsForm";
import OrderConfirmationDialog from "@/components/OrderConfirmationDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart, deliveryCharge, grandTotal } = useCart();
  const { user } = useAuth();
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartExpiryTime] = useState(() => new Date(Date.now() + 30 * 60 * 1000));

  const handleDetailsSubmit = (details: CustomerDetails) => {
    setCustomerDetails(details);
    setShowConfirmDialog(true);
  };

  const handleOrderConfirm = async () => {
    if (!customerDetails) return;
    setShowConfirmDialog(false);
    setShowPayment(true);
  };

  const handleConfirmPayment = async () => {
    if (isProcessing) return; // Prevent double submission
    
    setIsProcessing(true);

    try {
      // Create order in backend
      const orderData = {
        customer: customerDetails,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.nameEn,
          productNameTa: item.product.nameTa,
          weight: item.selectedWeight,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        subtotal: totalPrice,
        deliveryCharge,
        grandTotal,
        paymentMethod: 'UPI'
      };

      const { data, error } = await supabase.functions.invoke('orders/create', {
        body: orderData
      });

      if (error) {
        console.error('Order creation error:', error);
        // Generate local order ID if backend fails
        const newOrderId = `ORD${Date.now().toString(36).toUpperCase()}`;
        setOrderId(newOrderId);
      } else if (data?.order?.id) {
        setOrderId(data.order.id);
      } else {
        const newOrderId = `ORD${Date.now().toString(36).toUpperCase()}`;
        setOrderId(newOrderId);
      }

      const finalOrderId = orderId || `ORD${Date.now().toString(36).toUpperCase()}`;
      if (!orderId) setOrderId(finalOrderId);
      
      setPaymentConfirmed(true);
      toast.success("Payment confirmed! / பணம் உறுதி செய்யப்பட்டது!");

      // Trigger WhatsApp notification with order details
      try {
        await supabase.functions.invoke('whatsapp-notify', {
          body: {
            type: 'order',
            orderId: finalOrderId,
            customer: customerDetails,
            items: items.map(item => ({
              name: item.product.nameEn,
              weight: item.selectedWeight,
              quantity: item.quantity,
              price: item.unitPrice * item.quantity
            })),
            subtotal: totalPrice,
            deliveryCharge,
            grandTotal
          }
        });
      } catch (notifyError) {
        console.log('WhatsApp notification pending:', notifyError);
      }

      // Send payment receipt to admin WhatsApp
      try {
        await supabase.functions.invoke('whatsapp-notify', {
          body: {
            type: 'receipt',
            orderId: finalOrderId,
            customer: customerDetails,
            items: items.map(item => ({
              name: item.product.nameEn,
              weight: item.selectedWeight,
              quantity: item.quantity,
              price: item.unitPrice * item.quantity
            })),
            subtotal: totalPrice,
            deliveryCharge,
            grandTotal,
            paymentMethod: 'UPI',
            paymentStatus: 'Confirmed',
            paidAt: new Date().toISOString()
          }
        });
      } catch (receiptError) {
        console.log('Receipt notification pending:', receiptError);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewInvoice = () => {
    // Store order in localStorage for invoice page
    localStorage.setItem("currentOrder", JSON.stringify({
      id: orderId,
      customer: customerDetails,
      items,
      subtotal: totalPrice,
      deliveryCharge,
      total: grandTotal,
      createdAt: new Date().toISOString(),
    }));
    clearCart();
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
            <CheckCircle className="mx-auto h-20 w-20 text-success mb-6" />
            <h1 className="font-serif text-3xl font-bold mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-xl text-muted-foreground tamil-text mb-4">
              ஆர்டர் வெற்றிகரமாக வைக்கப்பட்டது!
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-muted-foreground">
                Order ID: <span className="font-semibold text-foreground">{orderId}</span>
              </p>
              <p className="text-muted-foreground">
                Total Paid: <span className="font-semibold text-primary">₹{grandTotal}</span>
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
              <Button size="lg" onClick={handleViewInvoice}>
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
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
                  >
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFromCart(item.product.id, item.selectedWeight)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-serif">
                    UPI Payment
                    <span className="block text-lg font-normal text-muted-foreground tamil-text">
                      UPI பணம் செலுத்துதல்
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Scan the QR code or use the UPI ID below to make payment
                    </p>
                    <p className="text-sm text-muted-foreground tamil-text mb-6">
                      QR குறியீட்டை ஸ்கேன் செய்யவும் அல்லது கீழே உள்ள UPI ID பயன்படுத்தவும்
                    </p>

                    {/* Placeholder QR Code */}
                    <div className="mx-auto w-48 h-48 bg-secondary rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center text-muted-foreground">
                        <div className="text-4xl mb-2">📱</div>
                        <p className="text-sm">QR Code</p>
                        <p className="text-xs">(Placeholder)</p>
                      </div>
                    </div>

                    {/* UPI ID */}
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">UPI ID:</p>
                      <p className="text-lg font-mono font-semibold">homemade@upi</p>
                      <p className="text-xs text-muted-foreground mt-1">(Placeholder UPI ID)</p>
                    </div>

                    {/* Amount */}
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Amount to Pay:</p>
                      <p className="text-3xl font-bold text-primary">₹{grandTotal}</p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-pulse">Processing...</span>
                      </>
                    ) : (
                      <>
                        Confirm Payment
                        <span className="ml-2 text-sm tamil-text">பணம் உறுதி செய்</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPayment(false)}
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Details
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Click "Confirm Payment" after completing UPI payment
                    <br />
                    <span className="tamil-text">
                      UPI பணம் செலுத்திய பின் "பணம் உறுதி செய்" பொத்தானை கிளிக் செய்யவும்
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Order Confirmation Dialog */}
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
        />
      )}
    </div>
  );
};

export default Checkout;
