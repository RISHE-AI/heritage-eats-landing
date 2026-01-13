import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage (for demo - in production use MongoDB)
const orders: any[] = [];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    if (req.method === 'POST') {
      const body = await req.json();
      
      if (path === 'create') {
        const order = {
          id: `ORD${Date.now().toString(36).toUpperCase()}`,
          ...body,
          status: 'pending',
          createdAt: new Date().toISOString(),
          canCancel: true,
          cancelDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };
        
        orders.push(order);
        console.log('Order created:', order.id);
        
        // Send WhatsApp notification to admin (placeholder)
        console.log('TODO: Send WhatsApp notification for order:', order.id);
        
        return new Response(JSON.stringify({ success: true, order }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (path === 'list') {
        // Admin: list all orders
        const adminPassword = body.adminPassword;
        const expectedPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
        
        if (adminPassword !== expectedPassword) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify({ orders }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (req.method === 'GET') {
      const orderId = url.searchParams.get('id');
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Orders error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
