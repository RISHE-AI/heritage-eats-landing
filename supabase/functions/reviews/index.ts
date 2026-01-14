import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Review interface
interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  productId?: string;
  productName?: string;
  verified: boolean;
  createdAt: string;
}

// In-memory storage with initial sample reviews
const reviewsStore: Map<string, Review> = new Map();

// Initialize with sample reviews
const sampleReviews: Review[] = [
  { 
    id: '1', 
    name: 'Priya S.', 
    rating: 5, 
    comment: 'Amazing peanut ladoos! Tastes just like my grandmother used to make. Will order again!', 
    verified: true,
    createdAt: '2024-01-15T10:30:00Z' 
  },
  { 
    id: '2', 
    name: 'Rajesh K.', 
    rating: 5, 
    comment: 'The murukku is so crispy and fresh. Best I\'ve had in years. Highly recommended!', 
    verified: true,
    createdAt: '2024-01-14T15:45:00Z' 
  },
  { 
    id: '3', 
    name: 'Lakshmi V.', 
    rating: 4, 
    comment: 'Pirandai thokku is excellent for digestion. Authentic taste and good quality.', 
    verified: true,
    createdAt: '2024-01-13T09:20:00Z' 
  },
  { 
    id: '4', 
    name: 'Karthik M.', 
    rating: 5, 
    comment: 'Ordered for Diwali. Family loved everything! The Mysore Pak was heavenly.', 
    verified: true,
    createdAt: '2024-01-12T18:00:00Z' 
  },
  { 
    id: '5', 
    name: 'Deepa R.', 
    rating: 5, 
    comment: 'Black sesame ladoo is my new favorite. So healthy and delicious!', 
    verified: true,
    createdAt: '2024-01-11T12:15:00Z' 
  },
  { 
    id: '6', 
    name: 'Anand P.', 
    rating: 4, 
    comment: 'Good quality snacks. Packaging was excellent and delivery was on time.', 
    verified: true,
    createdAt: '2024-01-10T14:30:00Z' 
  },
  { 
    id: '7', 
    name: 'Meena R.', 
    rating: 5, 
    comment: 'The ABC malt is perfect for my kids. They love the taste and it\'s so nutritious!', 
    verified: true,
    createdAt: '2024-01-09T11:00:00Z' 
  },
  { 
    id: '8', 
    name: 'Suresh T.', 
    rating: 5, 
    comment: 'Curry leaves podi is fantastic! Great flavor and perfect spice level.', 
    verified: true,
    createdAt: '2024-01-08T16:45:00Z' 
  },
];

// Initialize sample reviews
sampleReviews.forEach(review => reviewsStore.set(review.id, review));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1];

    if (req.method === 'GET') {
      const reviews = Array.from(reviewsStore.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      
      // Get rating distribution
      const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };
      
      return new Response(JSON.stringify({ 
        reviews, 
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingDistribution
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      
      // Add new review
      if (action === 'add' || action === 'reviews') {
        const { name, rating, comment, productId, productName } = body;
        
        // Validate required fields
        if (!name || !rating || !comment) {
          return new Response(JSON.stringify({ 
            error: 'Name, rating, and comment are required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Validate rating
        if (rating < 1 || rating > 5) {
          return new Response(JSON.stringify({ 
            error: 'Rating must be between 1 and 5' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const review: Review = {
          id: crypto.randomUUID(),
          name,
          rating,
          comment,
          productId,
          productName,
          verified: false,
          createdAt: new Date().toISOString()
        };
        
        reviewsStore.set(review.id, review);
        console.log('Review added:', review.id);
        
        const reviews = Array.from(reviewsStore.values());
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
      
      // Admin: delete review
      if (action === 'delete') {
        const { reviewId, adminPassword } = body;
        const expectedPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
        
        if (adminPassword !== expectedPassword) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (!reviewsStore.has(reviewId)) {
          return new Response(JSON.stringify({ error: 'Review not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        reviewsStore.delete(reviewId);
        console.log('Review deleted:', reviewId);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Admin: verify review
      if (action === 'verify') {
        const { reviewId, adminPassword } = body;
        const expectedPassword = Deno.env.get('ADMIN_PASSWORD') || 'admin123';
        
        if (adminPassword !== expectedPassword) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const review = reviewsStore.get(reviewId);
        if (!review) {
          return new Response(JSON.stringify({ error: 'Review not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        review.verified = true;
        reviewsStore.set(reviewId, review);
        console.log('Review verified:', reviewId);
        
        return new Response(JSON.stringify({ success: true, review }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Reviews error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
