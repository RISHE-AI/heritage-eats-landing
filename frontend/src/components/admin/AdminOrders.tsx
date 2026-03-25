import React, { useState, useEffect } from 'react';
import { fetchOrders as apiFetchOrders, updateOrderStatus as apiUpdateOrderStatus, markOrderAsPaid, fetchCodStats } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, Filter, ChevronLeft, ChevronRight, Eye,
  Package, Clock, CheckCircle, XCircle, RefreshCw,
  Banknote, CreditCard, AlertCircle, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminOrdersProps {
  password: string;
  onLogout: () => void;
}

interface Order {
  _id: string;
  orderId?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  items: any[];
  subtotal: number;
  deliveryCharge: number;
  total?: number;
  grandTotal?: number;
  totalAmount?: number;
  status: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}

interface CodStats {
  pending: { amount: number; count: number };
  collected: { amount: number; count: number };
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ password, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [codStats, setCodStats] = useState<CodStats | null>(null);

  useEffect(() => {
    fetchOrders();
    loadCodStats();
  }, [currentPage, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await apiFetchOrders(
        statusFilter === 'all' ? undefined : statusFilter,
        paymentFilter === 'all' ? undefined : paymentFilter
      );
      if (result.success) {
        setOrders(result.data || []);
        setTotalPages(Math.ceil((result.data?.length || 0) / 10) || 1);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error.message && (error.message.includes('Not authorized') || error.message.includes('token failed'))) {
        onLogout();
      }
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadCodStats = async () => {
    try {
      const result = await fetchCodStats();
      if (result.success) {
        setCodStats(result.data);
      }
    } catch (error) {
      console.error('Error loading COD stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiUpdateOrderStatus(orderId, { orderStatus: status });
      toast.success('Order status updated');
      fetchOrders();
      setShowOrderDialog(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const handleMarkAsPaid = async (orderId: string) => {
    setMarkingPaid(true);
    try {
      const result = await markOrderAsPaid(orderId);
      if (result.success) {
        toast.success('Order marked as paid!');
        fetchOrders();
        loadCodStats();
        if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderId === orderId)) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: 'paid', paidAt: new Date().toISOString() });
        }
      }
    } catch (error: any) {
      console.error('Error marking as paid:', error);
      toast.error(error.message || 'Failed to mark as paid');
    } finally {
      setMarkingPaid(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      confirmed: { variant: 'default', icon: Package },
      completed: { variant: 'default', icon: CheckCircle },
      delivered: { variant: 'default', icon: CheckCircle },
      cancelled: { variant: 'destructive', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method?: string) => {
    if (method === 'cod') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
          <Banknote className="h-3 w-3" /> COD
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
        <CreditCard className="h-3 w-3" /> Razorpay
      </span>
    );
  };

  const getPaymentStatusBadge = (status?: string) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
          <CheckCircle className="h-3 w-3" /> Paid
        </span>
      );
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
          <XCircle className="h-3 w-3" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
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

  if (loading && orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* COD Stats Cards */}
      {codStats && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-amber-500 overflow-hidden">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">COD Pending</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">₹{(codStats.pending.amount || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{codStats.pending.count} order{codStats.pending.count !== 1 ? 's' : ''}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 overflow-hidden">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">COD Collected</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">₹{(codStats.collected.amount || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{codStats.collected.count} order{codStats.collected.count !== 1 ? 's' : ''}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[180px]">
                  <Banknote className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Payment filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="cod_pending">COD Pending</SelectItem>
                  <SelectItem value="cod_paid">COD Paid</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => { fetchOrders(); loadCodStats(); }}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-medium">
                        #{order.orderId || order._id.slice(-8).toUpperCase()}
                      </span>
                      {getStatusBadge(order.orderStatus || order.status)}
                      {getPaymentMethodBadge(order.paymentMethod)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <p className="text-sm font-medium">{order.customer?.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer?.phone}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} items
                      </p>
                      <p className="font-bold text-lg">
                        ₹{(order.totalAmount || order.total || order.grandTotal || 0).toLocaleString()}
                      </p>
                    </div>
                    {/* Mark as Paid quick action */}
                    {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:hover:bg-green-500/10"
                        onClick={() => handleMarkAsPaid(order._id)}
                        disabled={markingPaid}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?.orderId || selectedOrder?._id.slice(-8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Details */}
              <div>
                <h4 className="font-semibold mb-2">Customer Details</h4>
                <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                  <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customer?.name}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer?.phone}</p>
                  {selectedOrder.customer?.email && (
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customer?.email}</p>
                  )}
                  <p><span className="text-muted-foreground">Address:</span> {selectedOrder.customer?.address}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name || item.productName || item.product?.nameEn}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.weight} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">₹{item.price || item.totalPrice || 0}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>₹{selectedOrder.deliveryCharge?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>₹{(selectedOrder.totalAmount || selectedOrder.total || selectedOrder.grandTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Payment Method</span>
                    {getPaymentMethodBadge(selectedOrder.paymentMethod)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Status</span>
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                  {selectedOrder.paidAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Paid At</span>
                      <span className="text-sm">{formatDate(selectedOrder.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mark as Paid (for COD pending) */}
              {selectedOrder.paymentMethod === 'cod' && selectedOrder.paymentStatus === 'pending' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">COD Payment Pending</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        This order was placed with Cash on Delivery. Click the button below once payment has been collected.
                      </p>
                      <Button
                        className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        onClick={() => handleMarkAsPaid(selectedOrder._id)}
                        disabled={markingPaid}
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        {markingPaid ? 'Updating...' : 'Mark as Paid'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h4 className="font-semibold mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                    <Button
                      key={status}
                      variant={(selectedOrder.orderStatus || selectedOrder.status) === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      disabled={(selectedOrder.orderStatus || selectedOrder.status) === status}
                    >
                      {status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
