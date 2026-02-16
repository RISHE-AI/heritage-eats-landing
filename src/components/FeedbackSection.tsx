import React, { useState, useEffect } from "react";
import { Feedback } from "@/types/product";
import { fetchReviews, submitReview } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FeedbackSection: React.FC = () => {
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const result = await fetchReviews();
      if (result.success && result.data) {
        const mapped = result.data.map((r: any) => ({
          id: r._id || r.id,
          _id: r._id,
          name: r.customerName || r.name,
          customerName: r.customerName,
          productId: r.productId,
          rating: r.rating,
          comment: r.comment,
          approved: r.approved,
          createdAt: r.createdAt,
        }));
        setReviews(mapped);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitReview({
        customerName: name.trim(),
        rating,
        comment: comment.trim(),
      });
      if (result.success) {
        toast.success("Review submitted! / விமர்சனம் சமர்ப்பிக்கப்பட்டது!");
        setName("");
        setRating(5);
        setComment("");
        loadReviews();
      } else {
        toast.error("Failed to submit review");
      }
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Split reviews into 3 rows
  const row1 = reviews.filter((_, i) => i % 3 === 0);
  const row2 = reviews.filter((_, i) => i % 3 === 1);
  const row3 = reviews.filter((_, i) => i % 3 === 2);

  // Average rating
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  return (
    <section id="reviews" className="py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header with Total Count */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-serif text-2xl md:text-4xl font-bold mb-2">
            Customer Reviews / வாடிக்கையாளர் விமர்சனங்கள்
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "h-5 w-5",
                    s <= Math.round(avgRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">{avgRating}</span>
            <span className="text-muted-foreground">
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        </div>

        {/* 3 Animated Rows */}
        {reviews.length > 0 && (
          <div className="space-y-4 md:space-y-6 overflow-hidden mb-10 md:mb-14">
            <AnimatedRow reviews={row1} direction="left" speed={35} />
            <AnimatedRow reviews={row2} direction="right" speed={40} />
            <AnimatedRow reviews={row3} direction="left" speed={30} />
          </div>
        )}

        {/* Submit Review Form */}
        <div className="max-w-lg mx-auto">
          <Card className="shadow-card">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-serif text-lg font-bold mb-4 text-center">
                Leave a Review / விமர்சனம் எழுதுங்கள்
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <Input
                  placeholder="Your Name / உங்கள் பெயர்"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6 transition-colors",
                          s <= (hoverRating || rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
                </div>
                <Textarea
                  placeholder="Your review... / உங்கள் விமர்சனம்..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review / சமர்ப்பிக்கவும்"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Animated row component with infinite scroll
const AnimatedRow: React.FC<{
  reviews: Feedback[];
  direction: "left" | "right";
  speed: number;
}> = ({ reviews, direction, speed }) => {
  if (reviews.length === 0) return null;

  // Duplicate reviews for seamless infinite scroll
  const duplicated = [...reviews, ...reviews, ...reviews];

  return (
    <div className="relative overflow-hidden group">
      <div
        className={cn(
          "flex gap-4 w-max",
          direction === "left" ? "animate-scroll-left" : "animate-scroll-right",
          "group-hover:[animation-play-state:paused]"
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {duplicated.map((review, index) => (
          <FeedbackCard key={`${review.id}-${index}`} feedback={review} />
        ))}
      </div>
    </div>
  );
};

const FeedbackCard: React.FC<{ feedback: Feedback }> = ({ feedback }) => {
  return (
    <Card className="w-[280px] md:w-[320px] shrink-0 shadow-card hover:shadow-hover transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm text-foreground truncate mr-2">
            {feedback.customerName || feedback.name}
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "h-3.5 w-3.5",
                  s <= feedback.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
          {feedback.comment}
        </p>
      </CardContent>
    </Card>
  );
};

export default FeedbackSection;