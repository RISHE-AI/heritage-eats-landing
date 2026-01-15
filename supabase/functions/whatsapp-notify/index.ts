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
    
    // Support both formats: { order: {...} } or direct { orderId, customer, items, ... }
    const orderId = body.orderId || body.order?.id;
    const customer = body.customer || body.order?.customer;
    const items = body.items || body.order?.items || [];
    const grandTotal = body.grandTotal || body.order?.total || body.order?.grandTotal;
    const subtotal = body.subtotal || body.order?.subtotal || 0;
    const deliveryCharge = body.deliveryCharge || body.order?.deliveryCharge || 0;
    
    if (!customer || !items.length) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: customer and items' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Format order message for WhatsApp
    const itemsList = items.map((item: any) => 
      `• ${item.name || item.productName || item.product?.nameEn} (${item.weight}) x${item.quantity} - ₹${item.price || item.totalPrice || item.unitPrice}`
    ).join('\n');
    
    const message = `
🛒 *New Order Received!*

*Order ID:* ${orderId}
*Date:* ${new Date().toLocaleString('en-IN')}

*Customer Details:*
📞 Name: ${customer.name}
📱 Phone: ${customer.phone}
📧 Email: ${customer.email || 'N/A'}
📍 Address: ${customer.address}

*Order Items:*
${itemsList}

*Subtotal:* ₹${subtotal}
*Delivery:* ₹${deliveryCharge}
*Total:* ₹${grandTotal}

---
Please confirm and process this order.
    `.trim();
    
    console.log('WhatsApp notification prepared:', message);
    
    // In production, integrate with WhatsApp Business API
    // For now, we log and return success
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Notification sent',
      whatsappMessage: message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('WhatsApp notify error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
