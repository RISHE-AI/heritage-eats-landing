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
import { CheckCircle, MapPin, Phone, User, Package, Mail, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

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
  onUpdateWeight?: (productId: string, oldWeight: string, newWeight: string, newPrice: number) => void;
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
  onUpdateQuantity,
  onUpdateWeight
}) => {
  const subtotal = grandTotal - deliveryCharge;

  const handleWeightChange = (item: CartItem, direction: 'prev' | 'next') => {
    if (!onUpdateWeight || !item.product.weightOptions || item.product.weightOptions.length <= 1) return;

    const currentIndex = item.product.weightOptions.findIndex(w =>
      w.weight === item.selectedWeight
    );

    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = item.product.weightOptions.length - 1;
    if (newIndex >= item.product.weightOptions.length) newIndex = 0;

    const newWeightOption = item.product.weightOptions[newIndex];
    if (newWeightOption) {
      onUpdateWeight(
        item.product.id,
        item.selectedWeight,
        newWeightOption.weight,
        newWeightOption.price
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[95vh] p-0 overflow-hidden">
        <AlertDialogHeader className="p-4 md:p-6 pb-3 md:pb-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <AlertDialogTitle className="font-serif text-xl md:text-2xl flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-full bg-primary/10">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <span className="text-lg md:text-xl">Confirm Order</span>
              <span className="block text-xs md:text-base font-normal text-muted-foreground tamil-text">
                ஆர்டரை உறுதிப்படுத்துங்கள்
              </span>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>

        <ScrollArea className="max-h-[55vh] md:max-h-[60vh]">
          <AlertDialogDescription asChild>
            <div className="p-4 md:p-6 space-y-4 md:space-y-5">
              {/* Customer Details Card */}
              <div className="bg-secondary/50 rounded-xl p-3 md:p-5 space-y-2 md:space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Delivery Details
                </h4>
                <div className="grid gap-1.5 md:gap-2 pl-6 md:pl-7 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{customerDetails.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                    <span className="text-xs md:text-sm">{customerDetails.phone}</span>
                  </div>
                  {customerDetails.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                      <span className="text-xs md:text-sm truncate">{customerDetails.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 mt-0.5 shrink-0" />
                    <span className="text-xs md:text-sm whitespace-pre-wrap">{customerDetails.address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Card */}
              <div className="space-y-2 md:space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                  <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Items ({items.length})
                </h4>
                <div className="space-y-2 md:space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.selectedWeight}-${index}`}
                      className="p-3 md:p-4 bg-secondary/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.nameEn}
                          className="h-14 w-14 md:h-16 md:w-16 rounded-md object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm md:text-base truncate">{item.product.nameEn}</p>
                          <p className="text-xs md:text-sm text-muted-foreground tamil-text truncate">{item.product.nameTa}</p>

                          {/* Weight & Quantity Controls */}
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 md:mt-3">
                            {/* Weight Selector - Stepper Style */}
                            {onUpdateWeight && item.product.weightOptions && item.product.weightOptions.length > 1 ? (
                              <div className="flex items-center bg-background rounded-lg border h-9 md:h-10">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-8 md:h-10 md:w-9 rounded-r-none"
                                  onClick={() => handleWeightChange(item, 'prev')}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="px-2 md:px-3 text-xs md:text-sm font-medium min-w-[60px] md:min-w-[70px] text-center">
                                  {item.selectedWeight}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-8 md:h-10 md:w-9 rounded-l-none"
                                  onClick={() => handleWeightChange(item, 'next')}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs md:text-sm text-muted-foreground bg-secondary px-2 py-1.5 rounded-md">
                                {item.selectedWeight}
                              </span>
                            )}

                            {/* Quantity Controls - Stepper Style */}
                            {onUpdateQuantity ? (
                              <div className="flex items-center bg-background rounded-lg border h-9 md:h-10">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 md:h-10 md:w-10 rounded-r-none"
                                  onClick={() => onUpdateQuantity(item.product.id, item.selectedWeight, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 md:w-10 text-center font-semibold text-sm md:text-base">{item.quantity}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 md:h-10 md:w-10 rounded-l-none"
                                  onClick={() => onUpdateQuantity(item.product.id, item.selectedWeight, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">×{item.quantity}</span>
                            )}

                            {/* Price */}
                            <span className="ml-auto font-bold text-primary text-base md:text-lg">
                              ₹{item.unitPrice * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Custom Message */}
                      {item.customMessage && (
                        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded italic">
                          📝 {item.customMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals Card */}
              <div className="bg-primary/5 rounded-xl p-3 md:p-5 space-y-2 md:space-y-3">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Delivery</span>
                  <span className="font-medium text-foreground">
                    ₹{deliveryCharge}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg md:text-xl font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">₹{grandTotal}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg p-2.5 md:p-3">
                By confirming, you agree to proceed with the payment.
                <span className="block tamil-text mt-0.5 md:mt-1">
                  உறுதிப்படுத்துவதன் மூலம், பணம் செலுத்த ஒப்புக்கொள்கிறீர்கள்.
                </span>
              </p>
            </div>
          </AlertDialogDescription>
        </ScrollArea>

        <AlertDialogFooter className="p-4 md:p-6 pt-3 md:pt-4 border-t bg-muted/30 flex-row gap-2 md:gap-3">
          <AlertDialogCancel
            disabled={isProcessing}
            className="flex-1 h-11 md:h-10 text-sm"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 h-11 md:h-10 bg-primary hover:bg-primary/90 text-sm"
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Confirm
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OrderConfirmationDialog;