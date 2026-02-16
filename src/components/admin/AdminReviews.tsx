import React, { useState, useEffect } from 'react';
import {
  fetchAllReviews, deleteReview as apiDeleteReview,
  approveReview as apiApproveReview,
  adminGetReviewSummary, adminGetReviewsGrouped
} from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Star, ChevronDown, ChevronUp, Trash2, Check,
  X, RefreshCw, MessageSquare, ThumbsUp, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminReviewsProps {
  password: string;
  onLogout: () => void;
}

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  approved?: boolean;
  productId?: string;
  productName?: string;
  category?: string;
  createdAt: string;
}

interface ReviewSummary {
  totalReviews: number;
  approvedReviews: number;
  avgRating: string;
  ratingBreakdown: Record<string, number>;
}

interface GroupedProduct {
  _id: string;
  productName: string;
  category: string;
  reviewCount: number;
  avgRating: number;
  reviews: Review[];
}

interface GroupedCategory {
  _id: string;
  reviewCount: number;
  avgRating: number;
  reviews: GroupedProduct[];
}

const AdminReviews: React.FC<AdminReviewsProps> = ({ password, onLogout }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'all' | 'grouped'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, summaryRes, groupedRes] = await Promise.all([
        fetchAllReviews(),
        adminGetReviewSummary(),
        adminGetReviewsGrouped()
      ]);

      if (reviewsRes.success) {
        setReviews(reviewsRes.data || []);
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (groupedRes.success) {
        setGroupedProducts(groupedRes.data?.byProduct || []);
        setGroupedCategories(groupedRes.data?.byCategory || []);
      }
    } catch (error: any) {
      console.error('Error loading review data:', error);
      if (error.message && (error.message.includes('Not authorized') || error.message.includes('token failed'))) {
        onLogout();
      }
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const result = await apiDeleteReview(reviewId);
      if (result.success) {
        toast.success('Review deleted');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review');
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const result = await apiApproveReview(reviewId);
      if (result.success) {
        toast.success('Review approved');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve review');
    }
  };

  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return dateString; }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const paginatedReviews = reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);
  const maxRating = summary ? Math.max(...Object.values(summary.ratingBreakdown), 1) : 1;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6 flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold">{summary?.totalReviews || 0}</p>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 font-medium">{summary?.approvedReviews || 0} approved</p>
              <p className="text-sm text-muted-foreground">
                {(summary?.totalReviews || 0) - (summary?.approvedReviews || 0)} pending
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6 flex items-center gap-4">
            <div>
              <p className="text-3xl font-bold">{summary?.avgRating || '0.0'}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
            {renderStars(Math.round(parseFloat(summary?.avgRating || '0')))}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2 text-muted-foreground">Rating Breakdown</p>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map(star => {
                const count = summary?.ratingBreakdown?.[star] || 0;
                const width = maxRating > 0 ? (count / maxRating) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3">{star}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full transition-all" style={{ width: `${width}%` }} />
                    </div>
                    <span className="w-6 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {groupedCategories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Reviews by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {groupedCategories.map(cat => (
                <Badge key={cat._id} variant="secondary" className="px-3 py-1.5 text-sm">
                  {cat._id}: {cat.reviewCount} reviews (★ {cat.avgRating.toFixed(1)})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Toggle + Refresh */}
      <div className="flex items-center gap-2">
        <Button
          variant={view === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('all')}
        >
          <MessageSquare className="h-4 w-4 mr-1" /> All Reviews
        </Button>
        <Button
          variant={view === 'grouped' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('grouped')}
        >
          <BarChart3 className="h-4 w-4 mr-1" /> By Product
        </Button>
        <Button variant="outline" size="sm" onClick={loadData} className="ml-auto">
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* All Reviews View */}
      {view === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              All Reviews ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paginatedReviews.length > 0 ? (
              <div className="space-y-3">
                {paginatedReviews.map(review => (
                  <div key={review._id} className="p-4 rounded-lg bg-secondary/50 border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{review.customerName}</span>
                          {renderStars(review.rating)}
                          {review.approved === false && (
                            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">Pending</Badge>
                          )}
                        </div>
                        {review.productName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {review.productName} {review.category && `(${review.category})`}
                          </p>
                        )}
                        {review.comment && (
                          <p className="text-sm mt-1 text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {review.approved === false && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => handleApprove(review._id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(review._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-1 mt-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grouped by Product View */}
      {view === 'grouped' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reviews by Product ({groupedProducts.length} products)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupedProducts.length > 0 ? (
              <div className="space-y-2">
                {groupedProducts.map(group => (
                  <div key={group._id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleProduct(group._id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{group.productName || group._id || 'General'}</span>
                        {group.category && (
                          <Badge variant="secondary" className="text-xs">{group.category}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{group.reviewCount} reviews</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{group.avgRating?.toFixed(1) || '0.0'}</span>
                        </div>
                        {expandedProducts.has(group._id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {expandedProducts.has(group._id) && (
                      <div className="border-t bg-background/50 p-3 space-y-2">
                        {group.reviews.map(review => (
                          <div key={review._id} className="flex items-start justify-between gap-2 p-2 rounded bg-secondary/30">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{review.customerName}</span>
                                {renderStars(review.rating)}
                              </div>
                              {review.comment && (
                                <p className="text-sm text-muted-foreground mt-0.5">{review.comment}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(review.createdAt)}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => handleDelete(review._id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No grouped reviews available.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReviews;
