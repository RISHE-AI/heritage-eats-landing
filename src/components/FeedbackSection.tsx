import React, { useState } from "react";
import { Feedback } from "@/types/product";
import { initialFeedback } from "@/data/feedback";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FeedbackSection: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(initialFeedback);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Please fill in all fields / அனைத்து புலங்களையும் நிரப்பவும்");
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      createdAt: new Date(),
    };

    setFeedbackList(prev => [newFeedback, ...prev]);
    setName("");
    setComment("");
    setRating(5);
    toast.success("Thank you for your feedback! / உங்கள் கருத்துக்கு நன்றி!");
  };

  // Duplicate feedback for infinite scroll
  const duplicatedFeedback = [...feedbackList, ...feedbackList];
  const halfLength = feedbackList.length;

  return (
    <section id="feedback" className="py-12 md:py-16 bg-secondary/30">
      <div className="container px-4 md:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Customer Reviews
          </h2>
          <p className="mt-2 text-xl text-muted-foreground tamil-text">
            வாடிக்கையாளர் மதிப்புரைகள்
          </p>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-gold to-primary" />
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative overflow-hidden mb-12">
          {/* Row 1 - Left to Right */}
          <div className="flex mb-4 pause-animation animate-scroll-left">
            {duplicatedFeedback.slice(0, halfLength * 2).map((feedback, index) => (
              <FeedbackCard key={`row1-${index}`} feedback={feedback} />
            ))}
          </div>

          {/* Row 2 - Right to Left */}
          <div className="flex pause-animation animate-scroll-right">
            {duplicatedFeedback.slice(0, halfLength * 2).reverse().map((feedback, index) => (
              <FeedbackCard key={`row2-${index}`} feedback={feedback} />
            ))}
          </div>
        </div>

        {/* Add Feedback Form */}
        <div className="mx-auto max-w-lg">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <h3 className="text-center font-serif text-xl font-semibold mb-4">
                Share Your Experience
                <span className="block text-sm text-muted-foreground tamil-text">
                  உங்கள் அனுபவத்தைப் பகிரவும்
                </span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name / உங்கள் பெயர்"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-6 w-6",
                            (hoverRating || rating) >= star
                              ? "fill-gold text-gold"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Textarea
                    placeholder="Your comment / உங்கள் கருத்து"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Review
                  <span className="ml-2 text-xs tamil-text">மதிப்புரை சமர்ப்பிக்கவும்</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const FeedbackCard: React.FC<{ feedback: Feedback }> = ({ feedback }) => {
  return (
    <Card className="flex-shrink-0 w-80 mx-3 shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= feedback.rating ? "fill-gold text-gold" : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-foreground line-clamp-3">{feedback.comment}</p>
        <p className="mt-2 text-sm font-medium text-primary">— {feedback.name}</p>
      </CardContent>
    </Card>
  );
};

export default FeedbackSection;
