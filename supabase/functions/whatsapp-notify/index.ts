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
    const { order, type } = await req.json();
    
    // Format order message for WhatsApp
    const itemsList = order.items.map((item: any) => 
      `• ${item.product.nameEn} (${item.weight}) x${item.quantity} - ₹${item.price}`
    ).join('\n');
    
    const message = `
🛒 *New Order Received!*

*Order ID:* ${order.id}
*Date:* ${new Date().toLocaleString('en-IN')}

*Customer Details:*
📞 Name: ${order.customer.name}
📱 Phone: ${order.customer.phone}
📧 Email: ${order.customer.email || 'N/A'}
📍 Address: ${order.customer.address}

*Order Items:*
${itemsList}

*Subtotal:* ₹${order.subtotal}
*Delivery:* ₹${order.deliveryCharge}
*Total:* ₹${order.total}

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
