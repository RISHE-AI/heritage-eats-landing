import React, { useState, useEffect } from "react";
import { Star, Send, User, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { fetchReviews as apiFetchReviews, submitReview as apiSubmitReview, BACKEND_URL } from "@/services/api";
import { toast } from "sonner";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  productId?: string;
  productName?: string;
  reviewImage?: string;
  verified: boolean;
  createdAt: string;
}

interface ProductReviewsProps {
  productId?: string;
  productName?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const result = await apiFetchReviews(productId);

      if (result.success) {
        const reviewData = result.data || [];
        // Map backend fields to component fields
        const mapped = reviewData.map((r: any) => ({
          id: r._id || r.id,
          name: r.customerName || r.name,
          rating: r.rating,
          comment: r.comment,
          productId: r.productId,
          verified: r.approved !== undefined ? r.approved : (r.verified || false),
          reviewImage: r.reviewImage,
          createdAt: r.createdAt
        }));

        setReviews(mapped);
        setTotalReviews(mapped.length);

        // Calculate avg rating and distribution
        if (mapped.length > 0) {
          const sum = mapped.reduce((acc: number, r: any) => acc + r.rating, 0);
          setAvgRating(sum / mapped.length);

          const dist: Record<number, number> = {};
          mapped.forEach((r: any) => {
            dist[r.rating] = (dist[r.rating] || 0) + 1;
          });
          setRatingDistribution(dist);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !comment.trim() || rating === 0) {
      toast.error("Please fill in all fields and select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiSubmitReview({
        customerName: name.trim(),
        rating,
        comment: comment.trim(),
        productId,
      });

      toast.success("Thank you for your review! / உங்கள் மதிப்புரைக்கு நன்றி!");
      setName("");
      setRating(0);
      setComment("");
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              "transition-colors",
              star <= rating
                ? "text-gold fill-gold"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-6 p-4 bg-secondary/30 rounded-xl">
        {/* Average Rating */}
        <div className="text-center md:text-left md:border-r md:pr-6 border-border">
          <div className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</div>
          <div className="mt-1">{renderStars(Math.round(avgRating), "lg")}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-3">{star}</span>
                <Star className="h-3 w-3 text-gold fill-gold" />
                <Progress value={percentage} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Button */}
      {!showForm && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowForm(true)}
        >
          Write a Review / மதிப்புரை எழுதுங்கள்
        </Button>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-card animate-fade-in">
          <h4 className="font-semibold">Write Your Review</h4>

          {/* Star Rating Input */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Rating / உங்கள் மதிப்பீடு
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= (hoverRating || rating)
                        ? "text-gold fill-gold"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Name / உங்கள் பெயர்
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Review / உங்கள் கருத்து
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Review
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet. Be the first to review!
            <span className="block tamil-text text-sm mt-1">
              இன்னும் மதிப்புரைகள் இல்லை. முதலில் மதிப்புரை செய்யுங்கள்!
            </span>
          </p>
        ) : (
          reviews.slice(0, 5).map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-lg bg-secondary/20 border border-border/50 animate-fade-in"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.name}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderStars(review.rating, "sm")}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-muted-foreground">{review.comment}</p>
              {review.reviewImage && (
                <div className="mt-3 rounded-lg overflow-hidden h-32 w-full bg-secondary/20 max-w-xs">
                  <img
                    src={review.reviewImage.startsWith('http') ? review.reviewImage : `${BACKEND_URL}/${review.reviewImage.replace(/^\//, '')}`}
                    alt="Review"
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLDivElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
