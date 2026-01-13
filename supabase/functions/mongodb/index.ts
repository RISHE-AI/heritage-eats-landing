import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MongoDB Data API endpoint
const MONGODB_URI = Deno.env.get('MONGODB_URI') || '';
const DATABASE = 'homemade_delights';

// Helper to execute MongoDB operations via Data API
async function mongoOperation(collection: string, action: string, data: any) {
  // For now, we'll simulate MongoDB operations
  // In production, you'd use MongoDB Data API or a direct connection
  console.log(`MongoDB ${action} on ${collection}:`, JSON.stringify(data));
  return { success: true, data };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, collection, data } = await req.json();
    
    console.log(`MongoDB operation: ${action} on ${collection}`);

    let result;
    
    switch (action) {
      case 'insertOne':
        result = await mongoOperation(collection, 'insertOne', {
          ...data,
          _id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        });
        break;
      
      case 'find':
        result = await mongoOperation(collection, 'find', data);
        break;
      
      case 'updateOne':
        result = await mongoOperation(collection, 'updateOne', data);
        break;
      
      case 'deleteOne':
        result = await mongoOperation(collection, 'deleteOne', data);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
