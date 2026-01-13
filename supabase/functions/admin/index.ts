import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, password } = body;
    
    const expectedPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
    
    // Login check
    if (action === 'login') {
      if (password === expectedPassword) {
        return new Response(JSON.stringify({ success: true, token: 'admin-session' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: false, error: 'Invalid password' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Verify admin for other actions
    if (password !== expectedPassword) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    switch (action) {
      case 'getStats':
        // Return dashboard stats
        return new Response(JSON.stringify({
          totalOrders: 156,
          totalRevenue: 45670,
          totalCustomers: 89,
          avgRating: 4.8,
          monthlyOrders: [
            { month: 'Jan', orders: 45, revenue: 12500 },
            { month: 'Feb', orders: 52, revenue: 15200 },
            { month: 'Mar', orders: 59, revenue: 17970 }
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      
      case 'getOrders':
        return new Response(JSON.stringify({
          orders: [
            { id: 'ORD123ABC', customer: 'Priya S.', items: 3, total: 850, status: 'completed', date: '2024-03-15' },
            { id: 'ORD124DEF', customer: 'Rajesh K.', items: 5, total: 1250, status: 'pending', date: '2024-03-14' },
            { id: 'ORD125GHI', customer: 'Lakshmi V.', items: 2, total: 420, status: 'completed', date: '2024-03-13' }
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      
      case 'updateProduct':
        const { productId, updates } = body;
        console.log(`Updating product ${productId}:`, updates);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      
      case 'setProductAvailability':
        const { productId: pid, available } = body;
        console.log(`Setting product ${pid} availability to ${available}`);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Admin error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
