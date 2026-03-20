import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Home } from "lucide-react";
import { Order } from "@/types/product";

const Invoice: React.FC = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const storedOrder = localStorage.getItem("currentOrder");
    if (storedOrder) {
      const parsed = JSON.parse(storedOrder);
      setOrder({
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      });
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">No Order Found</h1>
          <Button onClick={() => navigate("/")} className="rounded-xl">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 print:py-0 print:bg-white">
      <div className="px-4 sm:px-6 max-w-2xl mx-auto">
        {/* Action Buttons - Hide on print */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 print:hidden">
          <Button onClick={handlePrint} className="gap-2 rounded-xl flex-1 sm:flex-none">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print Invoice / இன்வாய்ஸ் அச்சிடு</span>
            <span className="sm:hidden">Print Invoice</span>
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2 rounded-xl flex-1 sm:flex-none">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home / முகப்புக்கு திரும்பு</span>
            <span className="sm:hidden">Back to Home</span>
          </Button>
        </div>

        {/* Invoice Card */}
        <Card className="shadow-card rounded-2xl print:shadow-none print:border-0 overflow-hidden">
          <CardHeader className="text-center border-b px-4 sm:px-6">
            <div className="mb-4">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                Homemade Delights
              </h1>
              <p className="text-muted-foreground tamil-text text-sm">வீட்டு சமையல் சுவைகள்</p>
            </div>
            <CardTitle className="text-xl sm:text-2xl">
              INVOICE
              <span className="block text-base sm:text-lg font-normal text-muted-foreground tamil-text">
                இன்வாய்ஸ்
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Order Details */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 mb-5 sm:mb-6 text-sm">
              <div>
                <p className="text-muted-foreground text-xs sm:text-sm">Order ID / ஆர்டர் எண்:</p>
                <p className="font-semibold text-xs sm:text-sm break-all">{order.id}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-muted-foreground text-xs sm:text-sm">Date / தேதி:</p>
                <p className="font-semibold text-xs sm:text-sm">{formattedDate}</p>
              </div>
            </div>

            {/* Items — Mobile: Card list, Desktop: Table */}
            {/* Mobile Cards */}
            <div className="sm:hidden space-y-2.5 mb-5">
              {order.items.map((item, index) => (
                <div key={index} className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{item.product.nameEn}</p>
                      <p className="text-xs text-muted-foreground tamil-text truncate">{item.product.nameTa}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.selectedWeight}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">₹{item.unitPrice * item.quantity}</p>
                      <p className="text-[10px] text-muted-foreground">{item.quantity} × ₹{item.unitPrice}</p>
                    </div>
                  </div>
                  {item.customMessage && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 italic truncate">
                      📝 {item.customMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block border rounded-xl overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3 font-semibold text-sm">
                      Product / பொருள்
                    </th>
                    <th className="text-center p-3 font-semibold text-sm w-16">
                      Qty
                    </th>
                    <th className="text-right p-3 font-semibold text-sm w-20">
                      Price
                    </th>
                    <th className="text-right p-3 font-semibold text-sm w-24">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">
                        <p className="font-medium text-sm">{item.product.nameEn}</p>
                        <p className="text-xs text-muted-foreground tamil-text">{item.product.nameTa}</p>
                        <p className="text-[10px] text-muted-foreground">{item.selectedWeight}</p>
                        {item.customMessage && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 italic">
                            📝 {item.customMessage}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-center text-sm">{item.quantity}</td>
                      <td className="p-3 text-right text-sm">₹{item.unitPrice}</td>
                      <td className="p-3 text-right text-sm font-semibold">
                        ₹{item.unitPrice * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-56 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span>₹{order.deliveryCharge}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-primary">
                  <span className="font-bold text-base sm:text-lg">Grand Total:</span>
                  <span className="font-bold text-base sm:text-lg text-primary">₹{order.total}</span>
                </div>
                <p className="text-right text-xs sm:text-sm text-muted-foreground tamil-text">
                  மொத்த தொகை
                </p>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="mt-6 sm:mt-8 text-center pt-5 sm:pt-6 border-t">
              <p className="text-base sm:text-lg font-medium">Thank you for your order!</p>
              <p className="text-sm text-muted-foreground tamil-text">
                உங்கள் ஆர்டருக்கு நன்றி!
              </p>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
                For any queries, contact us at: +91 98765 43210
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground tamil-text">
                ஏதேனும் கேள்விகளுக்கு தொடர்பு கொள்ளவும்
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoice;
