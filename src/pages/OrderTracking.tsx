import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, Phone, Hash, ArrowLeft, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OrderItem {
  productId: string;
  productName: string;
  weight: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  canCancel: boolean;
  cancelDeadline: string;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', labelTa: 'ஆர்டர் செய்யப்பட்டது', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', labelTa: 'உறுதிப்படுத்தப்பட்டது', icon: CheckCircle },
  { key: 'processing', label: 'Processing', labelTa: 'செயலாக்கம்', icon: Package },
  { key: 'shipped', label: 'Shipped', labelTa: 'அனுப்பப்பட்டது', icon: Truck },
  { key: 'delivered', label: 'Delivered', labelTa: 'டெலிவரி செய்யப்பட்டது', icon: CheckCircle },
];

const OrderTracking = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'orderId' | 'phone'>('orderId');
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const searchValue = searchType === 'orderId' ? orderId.trim() : phone.trim();
    
    if (!searchValue) {
      toast.error(searchType === 'orderId' ? 'Please enter Order ID' : 'Please enter phone number');
      return;
    }

    if (searchType === 'phone' && !/^[6-9]\d{9}$/.test(searchValue)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setSearched(true);
    setOrders([]);
    setSelectedOrder(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orders/track?${searchType === 'orderId' ? `id=${searchValue}` : `phone=${searchValue}`}`
      );
      
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setOrders([]);
      } else if (data.orders) {
        setOrders(data.orders);
        if (data.orders.length === 1) {
          setSelectedOrder(data.orders[0]);
        }
      } else if (data.order) {
        setOrders([data.order]);
        setSelectedOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'confirmed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-muted-foreground';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Paid</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            உங்கள் ஆர்டரை கண்காணிக்கவும்
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="max-w-lg mx-auto mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg text-center">
                Search Your Order / உங்கள் ஆர்டரைத் தேடுங்கள்
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={searchType} onValueChange={(v) => setSearchType(v as 'orderId' | 'phone')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="orderId" className="gap-1.5 text-xs sm:text-sm">
                    <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Order ID
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="gap-1.5 text-xs sm:text-sm">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Phone Number
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="orderId" className="space-y-4">
                  <div>
                    <Label htmlFor="orderId" className="text-sm">Order ID / ஆர்டர் ஐடி</Label>
                    <Input
                      id="orderId"
                      placeholder="e.g., ORDABC123"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                      className="mt-1.5"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone Number / தொலைபேசி எண்</Label>
                    <Input
                      id="phone"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="mt-1.5"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={handleSearch} 
                className="w-full mt-4 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? 'Searching...' : 'Track Order'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {searched && !loading && orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8 sm:py-12"
            >
              <XCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-base sm:text-lg text-muted-foreground">
                No orders found / ஆர்டர்கள் எதுவும் இல்லை
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check your {searchType === 'orderId' ? 'Order ID' : 'phone number'} and try again
              </p>
            </motion.div>
          )}

          {orders.length > 1 && !selectedOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-3 sm:space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
                Your Orders ({orders.length}) / உங்கள் ஆர்டர்கள்
              </h2>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">{order.id}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="text-xs sm:text-sm mt-1">
                            {order.items.length} item(s) • ₹{order.grandTotal}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(order.orderStatus)} text-white shrink-0 text-xs`}>
                          {order.orderStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              {orders.length > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOrder(null)}
                  className="mb-4 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Orders
                </Button>
              )}

              {/* Order Header */}
              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">{selectedOrder.id}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Ordered on {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${getStatusColor(selectedOrder.orderStatus)} text-white`}>
                        {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                      </Badge>
                      {getPaymentBadge(selectedOrder.paymentStatus)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              {selectedOrder.orderStatus !== 'cancelled' ? (
                <Card className="mb-4 sm:mb-6">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Order Status / ஆர்டர் நிலை</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="flex justify-between relative z-10">
                        {statusSteps.map((step, index) => {
                          const isCompleted = getStatusIndex(selectedOrder.orderStatus) >= index;
                          const isCurrent = getStatusIndex(selectedOrder.orderStatus) === index;
                          const StepIcon = step.icon;

                          return (
                            <div key={step.key} className="flex flex-col items-center flex-1">
                              <motion.div
                                initial={false}
                                animate={{ 
                                  scale: isCurrent ? 1.1 : 1,
                                  backgroundColor: isCompleted ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                                }}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                                  isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'
                                }`}
                              >
                                <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </motion.div>
                              <p className={`text-[10px] sm:text-xs mt-1.5 text-center ${
                                isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                              }`}>
                                {step.label}
                              </p>
                              <p className="text-[8px] sm:text-[10px] text-muted-foreground text-center hidden sm:block">
                                {step.labelTa}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {/* Progress Line */}
                      <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${(getStatusIndex(selectedOrder.orderStatus) / (statusSteps.length - 1)) * 100}%` 
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-4 sm:mb-6 border-destructive">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <XCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-destructive mb-2" />
                    <p className="text-base sm:text-lg font-semibold text-destructive">Order Cancelled</p>
                    <p className="text-sm text-muted-foreground">ஆர்டர் ரத்து செய்யப்பட்டது</p>
                  </CardContent>
                </Card>
              )}

              {/* Order Details Grid */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Items */}
                <Card>
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Items / பொருட்கள்
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs sm:text-sm">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-muted-foreground">
                            {item.weight} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">₹{item.totalPrice}</p>
                      </div>
                    ))}
                    <div className="border-t pt-2 sm:pt-3 space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Subtotal</span>
                        <span>₹{selectedOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Delivery</span>
                        <span>₹{selectedOrder.deliveryCharge}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm sm:text-base">
                        <span>Total</span>
                        <span>₹{selectedOrder.grandTotal}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery & Payment */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address / டெலிவரி முகவரி
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-sm">{selectedOrder.customer.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{selectedOrder.customer.phone}</p>
                      <p className="text-xs sm:text-sm mt-1">{selectedOrder.customer.address}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment / கட்டணம்
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{selectedOrder.paymentMethod}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {selectedOrder.paymentStatus}
                          </p>
                        </div>
                        {getPaymentBadge(selectedOrder.paymentStatus)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Cancel Notice */}
              {selectedOrder.canCancel && selectedOrder.orderStatus === 'pending' && (
                <Card className="mt-4 sm:mt-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400">
                      You can cancel this order before {formatDate(selectedOrder.cancelDeadline)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-500">
                      இந்த ஆர்டரை {formatDate(selectedOrder.cancelDeadline)} க்கு முன் ரத்து செய்யலாம்
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;
