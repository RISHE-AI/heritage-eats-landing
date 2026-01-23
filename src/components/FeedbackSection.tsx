import React, { useState, useRef } from "react";
import { Feedback } from "@/types/product";
import { initialFeedback } from "@/data/feedback";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FeedbackSection: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(initialFeedback);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section id="feedback" className="py-10 md:py-16 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="mb-6 md:mb-8 text-center">
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Customer Reviews
          </h2>
          <p className="mt-1 md:mt-2 text-lg md:text-xl text-muted-foreground tamil-text">
            வாடிக்கையாளர் மதிப்புரைகள்
          </p>
          <div className="mx-auto mt-3 md:mt-4 h-1 w-20 md:w-24 rounded-full bg-gradient-to-r from-primary via-gold to-primary" />
        </div>

        {/* Horizontal Scrollable Reviews */}
        <div className="relative mb-8 md:mb-12">
          {/* Navigation Buttons - Hidden on mobile, shown on desktop */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background"
            onClick={scrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-1 py-2 md:px-10"
            style={{ scrollBehavior: 'smooth' }}
          >
            {feedbackList.map((feedback, index) => (
              <FeedbackCard key={feedback.id || index} feedback={feedback} />
            ))}
          </div>

          {/* Scroll indicators for mobile */}
          <div className="flex justify-center gap-1 mt-4 md:hidden">
            <div className="h-1 w-8 rounded-full bg-primary/50" />
            <div className="h-1 w-2 rounded-full bg-muted-foreground/30" />
            <div className="h-1 w-2 rounded-full bg-muted-foreground/30" />
          </div>
        </div>

        {/* Add Feedback Form */}
        <div className="mx-auto max-w-lg px-2">
          <Card className="shadow-card">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-center font-serif text-lg md:text-xl font-semibold mb-3 md:mb-4">
                Share Your Experience
                <span className="block text-xs md:text-sm text-muted-foreground tamil-text">
                  உங்கள் அனுபவத்தைப் பகிரவும்
                </span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <Input
                    placeholder="Your Name / உங்கள் பெயர்"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="h-11 md:h-10"
                  />
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 p-1"
                      >
                        <Star
                          className={cn(
                            "h-7 w-7 md:h-6 md:w-6",
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
                    className="resize-none"
                  />
                </div>

                <Button type="submit" className="w-full h-11 md:h-10 text-sm md:text-base">
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
    <Card className="flex-shrink-0 w-[280px] md:w-80 snap-center shadow-soft hover:shadow-card transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-1 mb-2">
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
        <p className="text-sm text-foreground line-clamp-3 min-h-[3.75rem]">{feedback.comment}</p>
        <p className="mt-3 text-sm font-medium text-primary">— {feedback.name}</p>
      </CardContent>
    </Card>
  );
};

export default FeedbackSection;