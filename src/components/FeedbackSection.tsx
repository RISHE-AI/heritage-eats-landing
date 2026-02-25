import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Shield, Quote, Send, Loader2, CheckCircle2, ImagePlus, X } from "lucide-react";
import { fetchAllReviews, submitReview } from "@/services/api";
import { toast } from "sonner";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userName?: string;
  customerName?: string;
  productName?: string;
  reviewImage?: string;
  createdAt: string;
  verified?: boolean;
  type?: string;
}

const DUPLICATE_KEY = "maghizam_overall_review_submitted";

/* ─── Single Review Card ─── */
const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const BACKEND = 'https://heritage-eats-landing-1.onrender.com';
  return (
    <Card className="rounded-2xl shadow-card flex-shrink-0 w-[300px] sm:w-[320px] md:w-[340px] snap-center">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {((review.userName || review.customerName) || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold truncate">{review.userName || review.customerName || "Customer"}</span>
              {review.verified !== false && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-success font-medium bg-success/10 px-1.5 py-0.5 rounded-full">
                  <Shield className="h-2.5 w-2.5" /> Verified
                </span>
              )}
            </div>
            <div className="flex gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`h-3 w-3 ${s <= review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2.5 text-sm text-foreground/80 leading-relaxed line-clamp-3">
          <Quote className="h-3 w-3 text-muted-foreground/30 inline mr-1 -mt-0.5" />
          {review.comment}
        </p>
        {review.reviewImage && (
          <div className="mt-3 rounded-lg overflow-hidden h-28 w-full bg-secondary/20">
            <img
              src={review.reviewImage.startsWith('http') ? review.reviewImage : `${BACKEND}/${review.reviewImage.replace(/^\//, '')}`}
              alt="Review"
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLDivElement).style.display = 'none'; }}
            />
          </div>
        )}
        {review.productName && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            Reviewed: {review.productName}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/* ─── Marquee Row Component ─── */
const MarqueeRow: React.FC<{
  reviews: Review[];
  direction: "left" | "right";
  speed?: number;
}> = ({ reviews, direction, speed = 40 }) => {
  const [paused, setPaused] = useState(false);

  if (reviews.length === 0) return null;

  // Duplicate the reviews to create seamless loop
  const duplicated = [...reviews, ...reviews];

  return (
    <div
      className="overflow-hidden py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex gap-4"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {duplicated.map((review, idx) => (
          <ReviewCard key={`${review._id}-${idx}`} review={review} />
        ))}
      </div>
    </div>
  );
};

/* ─── Main Section ─── */
const FeedbackSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAlreadySubmitted(!!localStorage.getItem(DUPLICATE_KEY));
    fetchAllReviews()
      .then(res => {
        if (res.success) setReviews(res.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Split reviews into 3 rows of 4 (or distribute evenly if fewer/more)
  const rows = useMemo(() => {
    const all = [...reviews];
    const perRow = 4;
    const row1 = all.slice(0, perRow);
    const row2 = all.slice(perRow, perRow * 2);
    const row3 = all.slice(perRow * 2, perRow * 3);
    return [row1, row2, row3];
  }, [reviews]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setReviewImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReviewImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim()) { toast.error("Please enter your name"); return; }
    if (!reviewRating) { toast.error("Please select a rating"); return; }
    if (!reviewComment.trim()) { toast.error("Please write a comment"); return; }

    setSubmitting(true);
    try {
      const res = await submitReview({
        customerName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        type: "overall",
        productId: "",
        productName: "",
        reviewImage: reviewImageFile,
      });
      if (res.success) {
        localStorage.setItem(DUPLICATE_KEY, "1");
        setAlreadySubmitted(true);
        setSubmitSuccess(true);
        toast.success("Thank you for your review! 🎉");
        const updated = await fetchAllReviews();
        if (updated.success) setReviews(updated.data);
      } else {
        toast.error(res.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-10 md:py-16 bg-secondary/20">
      {/* Marquee CSS animation */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <div className="container px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Customer Reviews
          </h2>
          <p className="mt-1 text-sm text-muted-foreground tamil-text">
            வாடிக்கையாளர் மதிப்புரைகள்
          </p>
          <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
          {reviews.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">{reviews.length} reviews from happy customers</p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading reviews...
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="rounded-2xl shadow-card">
                <CardContent className="p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Overall Rating */}
                    <div className="text-center md:text-left">
                      <div className="flex items-baseline gap-2 justify-center md:justify-start">
                        <span className="text-4xl font-bold text-foreground">{avgRating}</span>
                        <span className="text-muted-foreground text-sm">/ 5</span>
                      </div>
                      <div className="flex gap-0.5 justify-center md:justify-start mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
                    </div>

                    {/* Rating Bars */}
                    <div className="space-y-1.5">
                      {ratingCounts.map(({ star, count, pct }) => (
                        <div
                          key={star}
                          className="w-full flex items-center gap-2 py-0.5 text-xs rounded-md px-1"
                        >
                          <span className="w-5 text-right font-medium">{star}★</span>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-muted-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Marquee Review Rows ── */}
            <div className="space-y-2 -mx-4 md:-mx-8">
              {rows[0].length > 0 && <MarqueeRow reviews={rows[0]} direction="left" speed={35} />}
              {rows[1].length > 0 && <MarqueeRow reviews={rows[1]} direction="right" speed={38} />}
              {rows[2].length > 0 && <MarqueeRow reviews={rows[2]} direction="left" speed={32} />}
            </div>
          </>
        )}

        {/* ── Leave Your Review Form ── */}
        <div className="max-w-xl mx-auto mt-12">
          <div className="text-center mb-6">
            <h3 className="font-serif text-lg font-bold text-foreground">Leave Your Review</h3>
            <p className="text-xs text-muted-foreground tamil-text mt-1">உங்கள் கருத்தை பகிரவும்</p>
            <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>

          {submitSuccess || alreadySubmitted ? (
            <Card className="rounded-2xl shadow-card border border-emerald-200/40 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Thank you for your review!</h4>
                <p className="text-sm text-emerald-700/70 dark:text-emerald-500">
                  Your feedback helps us serve you better. 🙏
                </p>
                <p className="text-xs text-emerald-600/60 dark:text-emerald-600 tamil-text mt-1">
                  உங்கள் கருத்திற்கு நன்றி!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl shadow-card">
              <CardContent className="p-5">
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Your Name</label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={80}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewRating(s)}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${s <= (hoverRating || reviewRating)
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                              }`}
                          />
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground self-center">
                          {["", "Poor", "Fair", "Good", "Great", "Excellent!"][reviewRating]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Your Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Share your experience with Maghizam Homemade Delights..."
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground text-right">{reviewComment.length}/500</p>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Photo (Optional)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    {reviewImagePreview ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                        <img src={reviewImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setReviewImageFile(null); setReviewImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border hover:border-primary/50 text-xs text-muted-foreground hover:text-foreground transition-all"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Add a photo
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl gap-2 h-11"
                    disabled={submitting || !reviewRating || !reviewName.trim() || !reviewComment.trim()}
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4" /> Submit Review</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;