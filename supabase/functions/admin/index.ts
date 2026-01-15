import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONGODB_URI = Deno.env.get('MONGODB_URI') || '';
const DATABASE = 'homemade_delights';
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'admin123';

let client: MongoClient | null = null;
let db: any = null;

async function getDatabase() {
  if (!client) {
    client = new MongoClient();
    await client.connect(MONGODB_URI);
    db = client.database(DATABASE);
    console.log('Connected to MongoDB Atlas for Admin');
  }
  return db;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, password } = body;
    
    console.log(`Admin action: ${action}`);
    
    // Login check
    if (action === 'login') {
      if (password === ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ success: true, token: crypto.randomUUID() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: false, error: 'Invalid password' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Verify admin for other actions
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const database = await getDatabase();
    
    switch (action) {
      case 'getStats': {
        const ordersCollection = database.collection('orders');
        const customersCollection = database.collection('customers');
        const reviewsCollection = database.collection('reviews');
        
        const [totalOrders, totalCustomers, orders, reviews] = await Promise.all([
          ordersCollection.countDocuments({}),
          customersCollection.countDocuments({}),
          ordersCollection.find({}).toArray(),
          reviewsCollection.find({}).toArray()
        ]);
        
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || order.grandTotal || 0), 0);
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length 
          : 0;
        
        // Group orders by month
        const monthlyOrders: Record<string, { orders: number; revenue: number }> = {};
        orders.forEach((order: any) => {
          const date = new Date(order.createdAt || order.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyOrders[monthKey]) {
            monthlyOrders[monthKey] = { orders: 0, revenue: 0 };
          }
          monthlyOrders[monthKey].orders++;
          monthlyOrders[monthKey].revenue += order.total || order.grandTotal || 0;
        });
        
        const monthlyData = Object.entries(monthlyOrders)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-6);
        
        return new Response(JSON.stringify({
          totalOrders,
          totalRevenue,
          totalCustomers,
          avgRating: avgRating.toFixed(1),
          monthlyOrders: monthlyData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'getOrders': {
        const { page = 1, limit = 20, status, startDate, endDate } = body;
        const ordersCollection = database.collection('orders');
        
        const query: any = {};
        if (status && status !== 'all') query.status = status;
        if (startDate || endDate) {
          query.createdAt = {};
          if (startDate) query.createdAt.$gte = startDate;
          if (endDate) query.createdAt.$lte = endDate;
        }
        
        const [orders, totalCount] = await Promise.all([
          ordersCollection.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
          ordersCollection.countDocuments(query)
        ]);
        
        return new Response(JSON.stringify({ 
          orders, 
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'getCustomers': {
        const { page = 1, limit = 20, search } = body;
        const customersCollection = database.collection('customers');
        
        const query: any = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ];
        }
        
        const [customers, totalCount] = await Promise.all([
          customersCollection.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
          customersCollection.countDocuments(query)
        ]);
        
        return new Response(JSON.stringify({ 
          customers, 
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'getReviews': {
        const { page = 1, limit = 20, verified } = body;
        const reviewsCollection = database.collection('reviews');
        
        const query: any = {};
        if (verified !== undefined) query.verified = verified;
        
        const [reviews, totalCount] = await Promise.all([
          reviewsCollection.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
          reviewsCollection.countDocuments(query)
        ]);
        
        return new Response(JSON.stringify({ 
          reviews, 
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'updateOrderStatus': {
        const { orderId, status } = body;
        const ordersCollection = database.collection('orders');
        
        await ordersCollection.updateOne(
          { _id: orderId },
          { $set: { status, updatedAt: new Date().toISOString() } }
        );
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'getProducts': {
        const productsCollection = database.collection('products');
        const products = await productsCollection.find({}).toArray();
        
        return new Response(JSON.stringify({ products }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'saveProduct': {
        const { product } = body;
        const productsCollection = database.collection('products');
        
        if (product._id) {
          await productsCollection.updateOne(
            { _id: product._id },
            { $set: { ...product, updatedAt: new Date().toISOString() } }
          );
        } else {
          await productsCollection.insertOne({
            ...product,
            _id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'deleteProduct': {
        const { productId } = body;
        const productsCollection = database.collection('products');
        
        await productsCollection.deleteOne({ _id: productId });
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'setProductAvailability': {
        const { productId, available } = body;
        const productsCollection = database.collection('products');
        
        await productsCollection.updateOne(
          { _id: productId },
          { $set: { available, updatedAt: new Date().toISOString() } }
        );
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'deleteReview': {
        const { reviewId } = body;
        const reviewsCollection = database.collection('reviews');
        
        await reviewsCollection.deleteOne({ _id: reviewId });
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'verifyReview': {
        const { reviewId, verified } = body;
        const reviewsCollection = database.collection('reviews');
        
        await reviewsCollection.updateOne(
          { _id: reviewId },
          { $set: { verified, updatedAt: new Date().toISOString() } }
        );
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
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
