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
import { CheckCircle, MapPin, Phone, User, Package } from "lucide-react";

interface OrderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  customerDetails: CustomerDetails;
  items: CartItem[];
  grandTotal: number;
  deliveryCharge: number;
  isProcessing?: boolean;
}

const OrderConfirmationDialog: React.FC<OrderConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  customerDetails,
  items,
  grandTotal,
  deliveryCharge,
  isProcessing = false
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Confirm Your Order
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-4 pt-4">
            {/* Customer Details */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Delivery Details
              </h4>
              <div className="text-sm space-y-1 pl-6">
                <p className="font-medium">{customerDetails.name}</p>
                <p className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customerDetails.phone}
                </p>
                <p className="flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                  <span className="whitespace-pre-wrap">{customerDetails.address}</span>
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items ({items.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="truncate flex-1">
                      {item.product.nameEn} ({item.selectedWeight}) × {item.quantity}
                    </span>
                    <span className="font-medium ml-2">₹{item.unitPrice * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{grandTotal - deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery:</span>
                <span className={deliveryCharge === 0 ? "text-success" : ""}>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">₹{grandTotal}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              By confirming, you agree to proceed with the payment.
              <span className="block tamil-text">
                உறுதிப்படுத்துவதன் மூலம், பணம் செலுத்த ஒப்புக்கொள்கிறீர்கள்.
              </span>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            Cancel / ரத்து
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Confirm Order / ஆர்டரை உறுதிசெய்"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderConfirmationDialog;
