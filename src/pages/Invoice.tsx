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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold mb-4">No Order Found</h1>
          <Button onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = order.createdAt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background py-8 print:py-0 print:bg-white">
      <div className="container px-4 max-w-2xl mx-auto">
        {/* Action Buttons - Hide on print */}
        <div className="flex gap-4 mb-6 print:hidden">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice / இன்வாய்ஸ் அச்சிடு
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home / முகப்புக்கு திரும்பு
          </Button>
        </div>

        {/* Invoice Card */}
        <Card className="shadow-card print:shadow-none print:border-0">
          <CardHeader className="text-center border-b">
            <div className="mb-4">
              <h1 className="font-serif text-3xl font-bold text-primary">
                Homemade Delights
              </h1>
              <p className="text-muted-foreground tamil-text">வீட்டு சமையல் சுவைகள்</p>
            </div>
            <CardTitle className="text-2xl">
              INVOICE
              <span className="block text-lg font-normal text-muted-foreground tamil-text">
                இன்வாய்ஸ்
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Order Details */}
            <div className="flex justify-between mb-6 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID / ஆர்டர் எண்:</p>
                <p className="font-semibold">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Date / தேதி:</p>
                <p className="font-semibold">{formattedDate}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3 font-semibold">
                      Product / பொருள்
                    </th>
                    <th className="text-center p-3 font-semibold w-20">
                      Qty / அளவு
                    </th>
                    <th className="text-right p-3 font-semibold w-24">
                      Price / விலை
                    </th>
                    <th className="text-right p-3 font-semibold w-28">
                      Total / மொத்தம்
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">
                        <p className="font-medium">{item.product.nameEn}</p>
                        <p className="text-sm text-muted-foreground tamil-text">
                          {item.product.nameTa}
                        </p>
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.product.price}</td>
                      <td className="p-3 text-right font-semibold">
                        ₹{item.product.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-48">
                <div className="flex justify-between py-2 border-t-2 border-primary">
                  <span className="font-bold text-lg">Grand Total:</span>
                  <span className="font-bold text-lg text-primary">₹{order.total}</span>
                </div>
                <p className="text-right text-sm text-muted-foreground tamil-text">
                  மொத்த தொகை
                </p>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="mt-8 text-center pt-6 border-t">
              <p className="text-lg font-medium">Thank you for your order!</p>
              <p className="text-muted-foreground tamil-text">
                உங்கள் ஆர்டருக்கு நன்றி!
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                For any queries, contact us at: +91 98765 43210
              </p>
              <p className="text-sm text-muted-foreground tamil-text">
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
