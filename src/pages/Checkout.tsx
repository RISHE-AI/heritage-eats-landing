import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleConfirmPayment = () => {
    // Generate order ID
    const newOrderId = `ORD${Date.now().toString(36).toUpperCase()}`;
    setOrderId(newOrderId);
    setPaymentConfirmed(true);
    toast.success("Payment confirmed! / பணம் உறுதி செய்யப்பட்டது!");
  };

  const handleViewInvoice = () => {
    // Store order in localStorage for invoice page
    localStorage.setItem("currentOrder", JSON.stringify({
      id: orderId,
      items,
      total: totalPrice,
      createdAt: new Date().toISOString(),
    }));
    clearCart();
    navigate("/invoice");
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
              Payment Successful!
            </h1>
            <p className="text-xl text-muted-foreground tamil-text mb-4">
              பணம் செலுத்துதல் வெற்றிகரமாக முடிந்தது!
            </p>
            <p className="text-muted-foreground mb-6">
              Order ID: <span className="font-semibold">{orderId}</span>
            </p>
            <Button size="lg" onClick={handleViewInvoice}>
              View Invoice / இன்வாய்ஸ் காண்க
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 md:py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop / கடைக்கு திரும்பு
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <div>
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
                    key={item.product.id}
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
                      <p className="text-primary font-semibold">₹{item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total / மொத்தம்:</span>
                    <span className="text-primary">₹{totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div>
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
                    <p className="text-3xl font-bold text-primary">₹{totalPrice}</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleConfirmPayment}
                >
                  Confirm Payment
                  <span className="ml-2 text-sm tamil-text">பணம் உறுதி செய்</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
