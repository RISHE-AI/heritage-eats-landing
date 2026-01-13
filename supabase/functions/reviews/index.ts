import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage (for demo - in production use MongoDB)
const reviews: any[] = [
  { id: '1', name: 'Priya S.', rating: 5, comment: 'Amazing peanut ladoos! Tastes just like my grandmother used to make. Will order again!', createdAt: '2024-01-15' },
  { id: '2', name: 'Rajesh K.', rating: 5, comment: 'The murukku is so crispy and fresh. Best I\'ve had in years. Highly recommended!', createdAt: '2024-01-14' },
  { id: '3', name: 'Lakshmi V.', rating: 4, comment: 'Pirandai thokku is excellent for digestion. Authentic taste and good quality.', createdAt: '2024-01-13' },
  { id: '4', name: 'Karthik M.', rating: 5, comment: 'Ordered for Diwali. Family loved everything! The Mysore Pak was heavenly.', createdAt: '2024-01-12' },
  { id: '5', name: 'Deepa R.', rating: 5, comment: 'Black sesame ladoo is my new favorite. So healthy and delicious!', createdAt: '2024-01-11' },
  { id: '6', name: 'Anand P.', rating: 4, comment: 'Good quality snacks. Packaging was excellent and delivery was on time.', createdAt: '2024-01-10' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      const totalReviews = reviews.length;
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      
      return new Response(JSON.stringify({ 
        reviews, 
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      
      const review = {
        id: crypto.randomUUID(),
        name: body.name,
        rating: body.rating,
        comment: body.comment,
        createdAt: new Date().toISOString()
      };
      
      reviews.unshift(review);
      console.log('Review added:', review.id);
      
      const totalReviews = reviews.length;
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      
      return new Response(JSON.stringify({ 
        success: true, 
        review,
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Reviews error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
