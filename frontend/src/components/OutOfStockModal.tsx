import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Clock, Package, AlertTriangle, Loader2 } from "lucide-react";
import { createStockRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface OutOfStockModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productNameTa?: string;
  availableQty: number;
  requestedQty: number;
  selectedWeight: string;
  unitPrice: number;
  onBuyAvailable: (availableQty: number) => void;
}

const OutOfStockModal: React.FC<OutOfStockModalProps> = ({
  open,
  onClose,
  productId,
  productName,
  productNameTa,
  availableQty,
  requestedQty,
  selectedWeight,
  unitPrice,
  onBuyAvailable
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const sendRequest = async (preference: "buy_available" | "buy_later" | "bulk") => {
    setLoading(preference);
    try {
      await createStockRequest({
        productId,
        productName,
        userEmail: email,
        userName: user?.name || "",
        userPhone: phone,
        requestedQty,
        availableQty,
        selectedWeight,
        preference
      });

      if (preference === "buy_available") {
        onBuyAvailable(availableQty);
        toast.success(
          <div>
            <p className="font-medium">Added {availableQty} kg to cart! / கார்ட்டில் சேர்க்கப்பட்டது!</p>
            <p className="text-sm text-muted-foreground">We'll notify you when more stock arrives.</p>
          </div>
        );
        onClose();
      } else if (preference === "buy_later") {
        toast.success(
          <div>
            <p className="font-medium">Request saved! / கோரிக்கை சேமிக்கப்பட்டது!</p>
            <p className="text-sm text-muted-foreground">We'll email you when {requestedQty} kg is available.</p>
          </div>
        );
        onClose();
      } else if (preference === "bulk") {
        onClose();
        navigate(`/bulk-order?preselect=${productId}&qty=${requestedQty}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save request");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[92vw] sm:max-w-md p-0 rounded-2xl overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Out of Stock</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 px-5 py-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="mx-auto w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Out of Stock
            </h2>
            <p className="text-white/80 text-xs mt-0.5 tamil-text">இருப்பு இல்லை</p>
          </div>
        </div>

        {/* Message */}
        <div className="px-5 py-4 space-y-4">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-center">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Only <span className="font-bold text-red-600 dark:text-red-400">{availableQty} kg</span> available.
              You requested <span className="font-bold text-foreground">{requestedQty} kg</span>.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 tamil-text">
              {availableQty} கிலோ மட்டுமே உள்ளது. நீங்கள் {requestedQty} கிலோ கோரினீர்கள்.
            </p>
          </div>

          {/* Product info */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/40">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{productName}</p>
              {productNameTa && <p className="text-xs text-muted-foreground tamil-text truncate">{productNameTa}</p>}
              <p className="text-xs text-muted-foreground">{selectedWeight} · ₹{unitPrice}</p>
            </div>
          </div>

          {/* Contact for notification */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground uppercase">Email (for notification)</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-8 text-xs"
                type="email"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground uppercase">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Buy Later */}
            <Button
              variant="outline"
              className="w-full h-11 gap-2 text-sm font-semibold rounded-xl border-2 border-primary/30 text-primary hover:bg-primary/5 transition-all active:scale-[0.98]"
              onClick={() => sendRequest("buy_later")}
              disabled={loading !== null}
            >
              {loading === "buy_later" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>Buy Full Quantity Later</span>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground -mt-1">
              முழு அளவை பின்னர் வாங்கவும் — Notify via email when sufficient
            </p>

            {/* Bulk Purchase */}
            <Button
              variant="outline"
              className="w-full h-11 gap-2 text-sm font-semibold rounded-xl border-2 border-amber-400/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all active:scale-[0.98]"
              onClick={() => sendRequest("bulk")}
              disabled={loading !== null}
            >
              {loading === "bulk" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              <span>Bulk Purchase</span>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground -mt-1">
              மொத்தமாக வாங்கவும் — Redirects to bulk order page
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OutOfStockModal;
