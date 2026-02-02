import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage - will persist until function cold start
// In production, this connects to MongoDB via the mongodb edge function
const ordersStore: Map<string, any> = new Map();
const customersStore: Map<string, any> = new Map();

// Order interface
interface Order {
  id: string;
  customerId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    weight: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
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

// Customer interface
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1];

    console.log(`Orders action: ${action}, method: ${req.method}`);

    if (req.method === 'POST') {
      const body = await req.json();
      
      // Create new order
      if (action === 'create') {
        const { customer, items, subtotal, deliveryCharge, grandTotal, paymentMethod } = body;
        
        // Validate required fields
        if (!customer?.name || !customer?.phone || !customer?.address) {
          return new Response(JSON.stringify({ 
            error: 'Customer name, phone, and address are required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (!items || items.length === 0) {
          return new Response(JSON.stringify({ 
            error: 'At least one item is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create or update customer
        let customerId = Array.from(customersStore.values())
          .find(c => c.phone === customer.phone)?._id;
        
        if (!customerId) {
          customerId = crypto.randomUUID();
          const newCustomer: Customer = {
            id: customerId,
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address,
            totalOrders: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          customersStore.set(customerId, newCustomer);
          console.log('Customer created:', customerId);
        } else {
          const existingCustomer = customersStore.get(customerId);
          existingCustomer.totalOrders += 1;
          existingCustomer.address = customer.address;
          existingCustomer.updatedAt = new Date().toISOString();
          customersStore.set(customerId, existingCustomer);
        }
        
        // Create order
        const orderId = `ORD${Date.now().toString(36).toUpperCase()}`;
        const order: Order = {
          id: orderId,
          customerId,
          customer: {
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address
          },
          items: items.map((item: any) => ({
            productId: item.productId || item.product?.id,
            productName: item.productName || item.product?.name,
            weight: item.weight || item.selectedWeight,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity
          })),
          subtotal,
          deliveryCharge,
          grandTotal,
          paymentStatus: 'pending',
          paymentMethod: paymentMethod || 'UPI',
          orderStatus: 'pending',
          canCancel: true,
          cancelDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        ordersStore.set(orderId, order);
        console.log('Order created:', orderId);
        
        // Log for WhatsApp notification (handled by whatsapp-notify function)
        console.log('WhatsApp notification data:', {
          orderId,
          customerName: customer.name,
          customerPhone: customer.phone,
          grandTotal,
          itemCount: items.length
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          order,
          message: 'Order created successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Update order status
      if (action === 'update-status') {
        const { orderId, status, paymentStatus } = body;
        const order = ordersStore.get(orderId);
        
        if (!order) {
          return new Response(JSON.stringify({ error: 'Order not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (status) order.orderStatus = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        order.updatedAt = new Date().toISOString();
        
        // Check if order can still be cancelled
        if (new Date() > new Date(order.cancelDeadline)) {
          order.canCancel = false;
        }
        
        ordersStore.set(orderId, order);
        
        return new Response(JSON.stringify({ success: true, order }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Cancel order
      if (action === 'cancel') {
        const { orderId } = body;
        const order = ordersStore.get(orderId);
        
        if (!order) {
          return new Response(JSON.stringify({ error: 'Order not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (!order.canCancel || new Date() > new Date(order.cancelDeadline)) {
          return new Response(JSON.stringify({ 
            error: 'Order can no longer be cancelled. The 30-minute cancellation window has expired.' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        order.orderStatus = 'cancelled';
        order.canCancel = false;
        order.updatedAt = new Date().toISOString();
        ordersStore.set(orderId, order);
        
        return new Response(JSON.stringify({ success: true, order }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Admin: list all orders
      if (action === 'list') {
        const adminPassword = body.adminPassword;
        const expectedPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
        
        if (adminPassword !== expectedPassword) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const orders = Array.from(ordersStore.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Calculate stats
        const stats = {
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.orderStatus === 'pending').length,
          completedOrders: orders.filter(o => o.orderStatus === 'delivered').length,
          totalRevenue: orders
            .filter(o => o.paymentStatus === 'completed')
            .reduce((sum, o) => sum + o.grandTotal, 0)
        };
        
        return new Response(JSON.stringify({ orders, stats }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Admin: list all customers
      if (action === 'customers') {
        const adminPassword = body.adminPassword;
        const expectedPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
        
        if (adminPassword !== expectedPassword) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const customers = Array.from(customersStore.values())
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return new Response(JSON.stringify({ customers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (req.method === 'GET') {
      const orderId = url.searchParams.get('id');
      const phone = url.searchParams.get('phone');
      const isTrackingRequest = url.pathname.includes('/track');
      
      // Track by Order ID
      if (orderId) {
        const order = ordersStore.get(orderId);
        
        if (!order) {
          return new Response(JSON.stringify({ error: 'Order not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Update canCancel status
        if (new Date() > new Date(order.cancelDeadline)) {
          order.canCancel = false;
        }
        
        return new Response(JSON.stringify({ order }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Track by Phone Number
      if (phone && isTrackingRequest) {
        const customerOrders = Array.from(ordersStore.values())
          .filter(o => o.customer.phone === phone)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        if (customerOrders.length === 0) {
          return new Response(JSON.stringify({ 
            error: 'No orders found for this phone number',
            orders: []
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Update canCancel status for all orders
        customerOrders.forEach(order => {
          if (new Date() > new Date(order.cancelDeadline)) {
            order.canCancel = false;
          }
        });
        
        return new Response(JSON.stringify({ orders: customerOrders }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Order ID or phone number required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Orders error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
