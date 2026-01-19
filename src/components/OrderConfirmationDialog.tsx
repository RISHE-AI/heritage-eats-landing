import React from "react";
import { CustomerDetails } from "@/contexts/AuthContext";
import { CartItem } from "@/types/product";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, MapPin, Phone, User, Package, Mail, Minus, Plus } from "lucide-react";

interface OrderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  customerDetails: CustomerDetails;
  items: CartItem[];
  grandTotal: number;
  deliveryCharge: number;
  isProcessing?: boolean;
  onUpdateQuantity?: (productId: string, weight: string, quantity: number) => void;
}

const OrderConfirmationDialog: React.FC<OrderConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  customerDetails,
  items,
  grandTotal,
  deliveryCharge,
  isProcessing = false,
  onUpdateQuantity
}) => {
  const subtotal = grandTotal - deliveryCharge;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl max-h-[95vh] p-0 overflow-hidden">
        <AlertDialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <AlertDialogTitle className="font-serif text-2xl flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span>Confirm Your Order</span>
              <span className="block text-base font-normal text-muted-foreground tamil-text">
                உங்கள் ஆர்டரை உறுதிப்படுத்துங்கள்
              </span>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <AlertDialogDescription asChild>
            <div className="p-6 space-y-5">
              {/* Customer Details Card */}
              <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-primary" />
                  Delivery Details / டெலிவரி விவரங்கள்
                </h4>
                <div className="grid gap-2 pl-7">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{customerDetails.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{customerDetails.phone}</span>
                  </div>
                  {customerDetails.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{customerDetails.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="whitespace-pre-wrap">{customerDetails.address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Card */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-base">
                  <Package className="h-5 w-5 text-primary" />
                  Order Items ({items.length}) / ஆர்டர் பொருட்கள்
                </h4>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border border-border/50"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.nameEn}
                        className="h-16 w-16 rounded-md object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.product.nameEn}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.selectedWeight} • ₹{item.unitPrice}
                        </p>
                      </div>
                      {onUpdateQuantity ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedWeight, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedWeight, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground shrink-0">×{item.quantity}</span>
                      )}
                      <span className="font-semibold text-foreground shrink-0 min-w-[60px] text-right">
                        ₹{item.unitPrice * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals Card */}
              <div className="bg-primary/5 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal / துணை மொத்தம்</span>
                  <span className="font-medium text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery / டெலிவரி</span>
                  <span className={`font-medium ${deliveryCharge === 0 ? "text-green-600" : "text-foreground"}`}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-foreground">Total / மொத்தம்</span>
                  <span className="text-primary">₹{grandTotal}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg p-3">
                By confirming, you agree to proceed with the payment.
                <span className="block tamil-text mt-1">
                  உறுதிப்படுத்துவதன் மூலம், பணம் செலுத்த ஒப்புக்கொள்கிறீர்கள்.
                </span>
              </p>
            </div>
          </AlertDialogDescription>
        </ScrollArea>

        <AlertDialogFooter className="p-6 pt-4 border-t bg-muted/30 flex-col sm:flex-row gap-3">
          <AlertDialogCancel 
            disabled={isProcessing}
            className="sm:flex-1"
          >
            Cancel / ரத்து
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={isProcessing}
            className="sm:flex-1 bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Order / ஆர்டரை உறுதிசெய்
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderConfirmationDialog;
