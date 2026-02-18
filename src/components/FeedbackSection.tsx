import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, ChevronLeft, ChevronRight, Shield, Quote } from "lucide-react";
import { fetchAllReviews } from "@/services/api";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userName?: string;
  productName?: string;
  createdAt: string;
  verified?: boolean;
}

const FeedbackSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const REVIEWS_PER_PAGE = 3;

  useEffect(() => {
    fetchAllReviews()
      .then(res => {
        if (res.success) setReviews(res.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const filteredReviews = filterRating
    ? reviews.filter(r => r.rating === filterRating)
    : reviews;

  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const visibleReviews = filteredReviews.slice(
    currentPage * REVIEWS_PER_PAGE,
    (currentPage + 1) * REVIEWS_PER_PAGE
  );

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <section id="feedback" className="py-10 md:py-16 bg-secondary/20">
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
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading reviews...
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
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
                        <button
                          key={star}
                          onClick={() => setFilterRating(filterRating === star ? null : star)}
                          className={`w-full flex items-center gap-2 py-0.5 text-xs transition-colors hover:bg-secondary/50 rounded-md px-1 ${filterRating === star ? "bg-primary/10" : ""
                            }`}
                        >
                          <span className="w-5 text-right font-medium">{star}★</span>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-muted-foreground">{count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 justify-center mb-5 flex-wrap">
              <Button
                variant={filterRating === null ? "default" : "outline"}
                size="sm"
                onClick={() => { setFilterRating(null); setCurrentPage(0); }}
                className="rounded-full text-xs h-7"
              >
                All ({reviews.length})
              </Button>
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratingCounts.find(r => r.star === star)?.count || 0;
                if (count === 0) return null;
                return (
                  <Button
                    key={star}
                    variant={filterRating === star ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setFilterRating(star); setCurrentPage(0); }}
                    className="rounded-full text-xs h-7 gap-1"
                  >
                    {star}★ ({count})
                  </Button>
                );
              })}
            </div>

            {/* Review Cards */}
            <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
              {visibleReviews.map((review) => (
                <Card key={review._id} className="rounded-2xl shadow-card hover:shadow-hover transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {(review.userName || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold truncate">{review.userName || "Customer"}</span>
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
                    {review.productName && (
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        Reviewed: {review.productName}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeedbackSection;