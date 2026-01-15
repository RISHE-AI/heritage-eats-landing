import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MONGODB_URI = Deno.env.get('MONGODB_URI') || '';
const DATABASE = 'homemade_delights';

let client: MongoClient | null = null;
let db: any = null;

async function getDatabase() {
  if (!client) {
    client = new MongoClient();
    await client.connect(MONGODB_URI);
    db = client.database(DATABASE);
    console.log('Connected to MongoDB Atlas');
  }
  return db;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, collection, data, filter, pipeline, sort, limit } = await req.json();
    
    console.log(`MongoDB operation: ${action} on ${collection}`);
    
    // Validate collection names
    const validCollections = ['customers', 'orders', 'reviews', 'products'];
    if (!validCollections.includes(collection)) {
      throw new Error(`Invalid collection: ${collection}. Valid collections are: ${validCollections.join(', ')}`);
    }

    const database = await getDatabase();
    const coll = database.collection(collection);
    
    let result;
    
    switch (action) {
      case 'insertOne': {
        const doc = {
          ...data,
          _id: data._id || crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const insertResult = await coll.insertOne(doc);
        result = { success: true, insertedId: insertResult, document: doc };
        break;
      }
      
      case 'insertMany': {
        const documents = data.map((doc: any) => ({
          ...doc,
          _id: doc._id || crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        const insertResult = await coll.insertMany(documents);
        result = { success: true, insertedIds: insertResult, documents };
        break;
      }
      
      case 'find': {
        const cursor = coll.find(filter || {});
        if (sort) cursor.sort(sort);
        if (limit) cursor.limit(limit);
        const documents = await cursor.toArray();
        result = { success: true, documents };
        break;
      }
      
      case 'findOne': {
        const document = await coll.findOne(filter || {});
        result = { success: true, document };
        break;
      }
      
      case 'updateOne': {
        const updateResult = await coll.updateOne(
          filter,
          { $set: { ...data, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
        result = { success: true, ...updateResult };
        break;
      }
      
      case 'updateMany': {
        const updateResult = await coll.updateMany(
          filter,
          { $set: { ...data, updatedAt: new Date().toISOString() } }
        );
        result = { success: true, ...updateResult };
        break;
      }
      
      case 'deleteOne': {
        const deleteResult = await coll.deleteOne(filter);
        result = { success: true, deletedCount: deleteResult };
        break;
      }
      
      case 'deleteMany': {
        const deleteResult = await coll.deleteMany(filter);
        result = { success: true, deletedCount: deleteResult };
        break;
      }
      
      case 'aggregate': {
        const documents = await coll.aggregate(pipeline || data).toArray();
        result = { success: true, documents };
        break;
      }
      
      case 'count': {
        const count = await coll.countDocuments(filter || {});
        result = { success: true, count };
        break;
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`MongoDB ${action} on ${collection}: completed successfully`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
