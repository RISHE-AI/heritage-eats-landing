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
    const notificationType = body.type || 'order';
    const orderId = body.orderId || body.order?.id;
    const customer = body.customer || body.order?.customer;
    const items = body.items || body.order?.items || [];
    const grandTotal = body.grandTotal || body.order?.total || body.order?.grandTotal;
    const subtotal = body.subtotal || body.order?.subtotal || 0;
    const deliveryCharge = body.deliveryCharge || body.order?.deliveryCharge || 0;
    const paymentMethod = body.paymentMethod || 'UPI';
    const paymentStatus = body.paymentStatus || 'Pending';
    const paidAt = body.paidAt || null;
    
    if (!customer || !items.length) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: customer and items' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Format order items list
    const itemsList = items.map((item: any) => 
      `• ${item.name || item.productName || item.product?.nameEn} (${item.weight}) x${item.quantity} - ₹${item.price || item.totalPrice || item.unitPrice}`
    ).join('\n');
    
    let message = '';
    
    if (notificationType === 'receipt') {
      // Payment receipt format
      message = `
💳 *PAYMENT RECEIPT*
━━━━━━━━━━━━━━━━━━━━━

📋 *Order ID:* ${orderId}
📅 *Date:* ${new Date(paidAt || Date.now()).toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━━
📞 Name: ${customer.name}
📱 Phone: ${customer.phone}
📧 Email: ${customer.email || 'N/A'}
📍 Address: ${customer.address}

━━━━━━━━━━━━━━━━━━━━━
🛒 *ORDER ITEMS*
━━━━━━━━━━━━━━━━━━━━━
${itemsList}

━━━━━━━━━━━━━━━━━━━━━
💰 *PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹${subtotal}
Delivery: ${deliveryCharge === 0 ? 'FREE' : '₹' + deliveryCharge}
━━━━━━━━━━━━━━━━━━━━━
*TOTAL PAID: ₹${grandTotal}*
━━━━━━━━━━━━━━━━━━━━━

💳 Payment Method: ${paymentMethod}
✅ Payment Status: ${paymentStatus}
🕐 Paid At: ${new Date(paidAt || Date.now()).toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━
Thank you for your purchase!
நன்றி! உங்கள் ஆர்டர் பதிவாகியுள்ளது.
      `.trim();
    } else {
      // New order notification format
      message = `
🛒 *NEW ORDER RECEIVED!*
━━━━━━━━━━━━━━━━━━━━━

📋 *Order ID:* ${orderId}
📅 *Date:* ${new Date().toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER DETAILS*
━━━━━━━━━━━━━━━━━━━━━
📞 Name: ${customer.name}
📱 Phone: ${customer.phone}
📧 Email: ${customer.email || 'N/A'}
📍 Address: ${customer.address}

━━━━━━━━━━━━━━━━━━━━━
🛒 *ORDER ITEMS*
━━━━━━━━━━━━━━━━━━━━━
${itemsList}

━━━━━━━━━━━━━━━━━━━━━
💰 *ORDER TOTAL*
━━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹${subtotal}
Delivery: ${deliveryCharge === 0 ? 'FREE' : '₹' + deliveryCharge}
━━━━━━━━━━━━━━━━━━━━━
*GRAND TOTAL: ₹${grandTotal}*
━━━━━━━━━━━━━━━━━━━━━

⏳ Please confirm and process this order.
      `.trim();
    }
    
    console.log(`WhatsApp ${notificationType} notification prepared:`, message);
    
    // In production, integrate with WhatsApp Business API
    // For now, we log and return success
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `${notificationType} notification sent`,
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
