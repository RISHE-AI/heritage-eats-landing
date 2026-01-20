import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '';

const systemPrompt = `You are a helpful assistant for "Homemade Delights" - a traditional South Indian homemade snacks and sweets business.

About the Business:
- We make traditional homemade snacks, sweets, pickles, malts, and podis
- All products are made fresh with natural ingredients, no preservatives
- We are based in Chennai, Tamil Nadu, India
- Contact: WhatsApp +91 98765 43210, Email: orders@homemadedelights.com

Products Available:
SWEETS: Peanut Ladoo (₹250/250g), Black Sesame Ladoo (₹280/250g), Urad Dal Ladoo (₹300/250g), Mysore Pak (₹350/250g), Traditional Ladoo (₹220/250g)
SNACKS: Mixture (₹180/250g), Murukku (₹200/250g)
PICKLES: Pirandai Thokku (₹150/200g), Tomato Thokku (₹120/200g)
MALTS: ABC Malt, Beetroot Malt, Carrot Malt, Sevvalai Malt, Atthi Malt, Satthu Maavu (₹200-350/250g)
PODI: Curry Leaves Podi, Pirandai Podi, Sundaikai Podi, Paruppu Podi, Poondu Podi (₹100-180/100g)

Delivery:
- ₹60 per kg delivery charge
- FREE delivery for orders above ₹1000
- Delivery within Chennai: 2-3 days
- Other areas: 4-7 days

Keep responses concise, friendly, and helpful. If asked about something unrelated to food or the business, politely redirect to food topics.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

    return new Response(JSON.stringify({ 
      response: assistantMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Sorry, I\'m having trouble right now. Please try again or contact us on WhatsApp at +91 98765 43210.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
